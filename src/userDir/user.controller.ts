import { JwtAuthGuard } from 'Utils/guard/user.guard';
import { RequestWithUser } from 'types/types';
import {
    Controller,
    Post,
    Get,
    Req,
    UseGuards,
    Body,
    Res,
    HttpStatus,
    Query,
    Param,
    HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';


@Controller('')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // @UseGuards(JwtAuthGuard)
    @Post('fxql-statements')
    async parseFXQL(@Res() response: Response, @Body() body: { FXQL: string } ) {
        const fxqlStatement = body.FXQL.replace(/\\n/g, '\n'); 
        const res = await this.userService.parseFXQL(fxqlStatement);
        return response.status(HttpStatus.CREATED).json(res);
    }

    @Post('2')
    async parseFXQL2(@Res() response: Response, @Body() body: { FXQL: string } ) {
        const fxqlStatement = body.FXQL.replace(/\\n/g, '\n'); 
        const res = await this.userService.parseMultipleFXQL(fxqlStatement);
        return response.status(HttpStatus.CREATED).json(res);
    }


}
