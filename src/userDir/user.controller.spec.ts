import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

// describe('UserController', () => {
//   let userController: UserController;
//   let userService: UserService;

//   beforeEach(async () => {
//     const app: TestingModule = await Test.createTestingModule({
//       controllers: [UserController],
//       providers: [UserService],
//     }).compile();

//     userController = app.get<UserController>(UserController);
//     userService = app.get<UserService>(UserService);
//   });

//   describe('parseFXQL', () => {
//     it('should return a response with the parsed FXQL statement', async () => {
//       // Mock the expected result from the UserService
//       const result = {
//         SourceCurrency: 'USD',
//         DestinationCurrency: 'GBP',
//         BuyPrice: '0.90',
//         SellPrice: '0.85',
//         CapAmount: 10000,
//       };

//       // Define a mock request body
//       const body = {
//         FXQL: 'USD-GBP { BUY 100 SELL 200 CAP 93800 }',
//       };

//       // Mock the response object
//       const responseMock = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn().mockReturnThis(),
//       } as unknown as Response;

//       // Mock the parseFXQL method from the service to return the mock result
//       jest.spyOn(userService, 'parseFXQL').mockResolvedValue(result);

//       // Call the controller method
//       await userController.parseFXQL(responseMock, body.FXQL);

//       // Check that the status method was called with HttpStatus.CREATED (201)
//       expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CREATED);

//       // Check that the json method was called with the result object
//       expect(responseMock.json).toHaveBeenCalledWith({
//         message: 'FXQL Statement Parsed Successfully.',
//         parsedStatement: result,
//       });
//     });
//   });
// });

