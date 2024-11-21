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
        @InjectModel("FXQL") private fxqlModel: Model<FXQL>,
    ) { }


    private generateAccessToken(payload: any): string {
        return jwt.sign({ payload }, accessTokenSecret, {
            expiresIn: '7d',
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
        return /^\d+$/.test(cap) && parseInt(cap, 10) >= 0;
    }

    public async parseFXQLSingularStatement(fxql: string): Promise<any> {

        if (!fxql || typeof fxql !== 'string') {
            throw new HttpException(
                'The FXQL input must be a non-empty string.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const pattern = /^([A-Z]{3}-[A-Z]{3}) {\n BUY (\d+(?:\.\d+)?)\n SELL (\d+(?:\.\d+)?)\n CAP (\d+)\n}$/;

        // Test the normalized string against the regex pattern
        const match = fxql.match(pattern);
        console.log({ match: match, fxql: fxql })

        if (!match) {
            throw new HttpException(
                `Invalid FXQL statement structure. The format should be like 'USD-GBP { BUY 100 SELL 200 CAP 93800 }'`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        const [_, curmash, buy, sell, cap] = match;
        const [curr1, curr2] = curmash.split("-");

        // Validate the currencies (CURR1 and CURR2)
        if (!this.isValidCurrency(curr1) || !this.isValidCurrency(curr2)) {
            throw new HttpException(
                `Invalid currency codes. Must be exactly 3 uppercase letters (e.g., USD, GBP).`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Validate BUY and SELL amounts
        if (!this.isValidAmount(buy) || !this.isValidAmount(sell)) {
            throw new HttpException(
                `BUY and SELL values must be valid positive numbers.`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Validate CAP
        if (!this.isValidCap(cap)) {
            throw new HttpException(
                `CAP value must be a non-negative whole number.`,
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        // Check for the maximum capacity of parsed statements
        const count = await this.fxqlModel.countDocuments().exec();
        if (count >= 1000) {
            throw new HttpException(
                `Parser is at maximum capacity, which is 1000 documents!`,
                HttpStatus.FORBIDDEN,
            );
        }

        // Create the parsed FXQL statement in the database
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
                // Remove extra spaces between newline and BUY, SELL, and CAP (if there's more than one space)
                let normalizedStatement = statement
                    .replace(/(\n)\s+(BUY|SELL|CAP)/g, '$1 $2')
                    .trim();
                const result = await this.parseFXQLSingularStatement(normalizedStatement);
                results.push(result);
            } catch (error) {
                try {
                    await this.parseFXQLSingularStatement(fxql);
                } catch (error) {
                    results.push({
                        error: error.message,
                        statement,
                    });
                }
            }
        }

        return results;
    }

}

