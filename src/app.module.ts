import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';
import { UserModule } from './userDir/user.module';
import { UserController } from './userDir/user.controller';
import { UserService } from './userDir/user.service';

config();

const databaseUrl = process.env.DATABASE_URL;

@Module({
  imports: [
    MongooseModule.forRoot(databaseUrl),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forFeature([
      // { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}