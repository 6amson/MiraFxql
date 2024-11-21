/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FXQL, FXQLSchema } from '../schema/parser.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FXQL.name, schema: FXQLSchema },
        ])
    ],
    controllers: [
        UserController
    ],
    providers: [
        UserService
    ],
    exports: [MongooseModule],
})
export class UserModule { }
