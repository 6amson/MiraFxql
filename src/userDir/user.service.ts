import { Document, Types } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { httpErrorException } from '../app.exception';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { config } from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { FXQL } from '../schema/parser.schema';


config();

const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET;


@Injectable()
export class UserService {
    constructor(
        @InjectModel(FXQL.name) private fxqlModel: Model<FXQL>,
    ) { }


    private generateAccessToken(payload: any): string {
        return jwt.sign({ payload }, accessTokenSecret, {
            expiresIn: '1d',
        });
    }

    // Validates a currency (3 uppercase characters)
    private isValidCurrency(currency: string): boolean {
        return /^[A-Z]{3}$/.test(currency);
    }

    // Validates if the number is a valid BUY/SELL value (positive numbers or decimals)
    private isValidAmount(amount: string): boolean {
        return /^(0|[1-9]\d*)(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
    }


    // Validates if the CAP value is a non-negative whole number
    private isValidCap(cap: string): boolean {
        return /^\d+$/.test(cap) && parseInt(cap, 10) >= 0; // Ensure CAP is a non-negative integer
    }

    public async parseFXQL(fxql: string): Promise<any> {

        if (!fxql || typeof fxql !== 'string') {
            throw new HttpException(
                'The FXQL input must be a non-empty string.',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Step 1: Clean up the input to remove escape characters (\n)
        const cleanedFXQL = fxql.replace(/\\n/g, '\n'); // Replace escape sequences with actual newlines

        // Step 2: Ensure that multiple statements are separated by newlines
        // if (cleanedFXQL.split('\n').length > 1 && cleanedFXQL.includes('}')) {
        //     throw new HttpException(
        //         `Multiple statements should be separated by a single newline character.`,
        //         HttpStatus.NOT_ACCEPTABLE,
        //     );
        // }

        // return cleanedFXQL;


        // Step 3: Match the structure (currency pair, BUY, SELL, CAP)
        // const regex = /([A-Z]{3})-([A-Z]{3})\s*\{\s*BUY\s*([\d.]+)\s*SELL\s*([\d.]+)\s*CAP\s*(\d+)\s*\}/;
        // const match = cleanedFXQL.match(regex);

        const pattern = /^([A-Z]{3}-[A-Z]{3}) {\n BUY (\d+(?:\.\d+)?)\n SELL (\d+(?:\.\d+)?)\n CAP (\d+)\n}$/;

        // Step 3: Test the normalized string against the regex pattern
        const match = fxql.match(pattern);
        // console.log({fxql: fxql});

        if (!match) {
            throw new HttpException(
                `Invalid FXQL statement structure. The format should be like 'USD-GBP { BUY 100 SELL 200 CAP 93800 }'`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        const [_, curmash, buy, sell, cap] = match;
        // return { curmash, buy, sell, cap, match };
        const [curr1, curr2] = curmash.split("-");

        // Step 4: Validate the currencies (CURR1 and CURR2)
        if (!this.isValidCurrency(curr1) || !this.isValidCurrency(curr2)) {
            throw new HttpException(
                `Invalid currency codes. Must be exactly 3 uppercase letters (e.g., USD, GBP).`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Step 5: Validate BUY and SELL amounts
        if (!this.isValidAmount(buy) || !this.isValidAmount(sell)) {
            throw new HttpException(
                `BUY and SELL values must be valid positive numbers.`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Step 6: Validate CAP
        if (!this.isValidCap(cap)) {
            throw new HttpException(
                `CAP value must be a non-negative whole number.`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Step 7: Check for the maximum capacity of parsed statements
        const count = await this.fxqlModel.countDocuments().exec();
        if (count >= 1000) {
            throw new HttpException(
                `Parser is at maximum capacity, which is 1000 documents!`,
                HttpStatus.FORBIDDEN,
            );
        }

        // Step 8: Create the parsed FXQL statement in the database
        const parsedStatement = await this.fxqlModel.create({
            SourceCurrency: curr1,
            DestinationCurrency: curr2,
            BuyPrice: buy,
            SellPrice: sell,
            CapAmount: cap,
        });

        return {
            message: 'FXQL Statement Parsed Successfully.',
            parsedStatement,
        };
    }

    public async parseMultipleFXQL(fxql: string): Promise<any[]> {
        const cleanedFXQL = fxql.replace(/\\n/g, '\n').trim();
        const statements = cleanedFXQL.split('\n\n');

        const results: any[] = [];
        for (const statement of statements) {
            try {
                let normalizedStatement = statement
                // Reduce spaces between BUY, SELL, and CAP keywords and their values, but preserve line breaks.
                .replace(/(BUY|SELL|CAP)\s+/g, '$1 ')  
                .replace(/\s*\n\s*/g, '\n')  // Reduce extra spaces between lines, but keep the line breaks intact.
                .trim();  // Trim any leading or trailing spaces

            // Debug log to observe the normalization
            // console.log('Original Statement:', statement);
            // console.log('Normalized Statement:', normalizedStatement);
                    console.log(statement, normalizedStatement);
                const result = await this.parseFXQL(normalizedStatement); // Reuse the existing `parseFXQL` method
                results.push(result);
            } catch (error) {
                // Capture errors for invalid statements
                results.push({
                    error: error.message,
                    statement,
                });
            }
        }

        return results;
    }

}

