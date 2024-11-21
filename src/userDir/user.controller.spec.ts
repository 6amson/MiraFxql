import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { UserModule } from './user.module';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
  });

  describe('parseMultipleFXQL', () => {
    it('should return a response with the parsed multiple FXQL statements', async () => {
      // Expected result from the service
      const expectedResults = [
        {
          message: 'FXQL Statement Parsed Successfully.',
          parsedStatement: {
            SourceCurrency: 'USD',
            DestinationCurrency: 'GBP',
            BuyPrice: '0.85',
            SellPrice: '0.90',
            CapAmount: 10000,
          },
        },
        {
          message: 'FXQL Statement Parsed Successfully.',
          parsedStatement: {
            SourceCurrency: 'EUR',
            DestinationCurrency: 'JPY',
            BuyPrice: '145.20',
            SellPrice: '146.50',
            CapAmount: 50000,
          },
        },
      ];

      // Mocked request body
      const requestBody = {
        FXQL: 'USD-GBP { BUY 0.85 SELL 0.90 CAP 10000 }\n\nEUR-JPY { BUY 145.20 SELL 146.50 CAP 50000 }',
      };

      // Mock the response object
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Mock the `parseMultipleFXQL` method from the service to return the expected results
      jest.spyOn(userService, 'parseMultipleFXQL').mockResolvedValue(expectedResults);

      // Call the controller method
      await userController.parseFXQL(responseMock, requestBody);

      // Assert that the status method was called with HttpStatus.CREATED (201)
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CREATED);

      // Assert that the json method was called with the expected result array
      expect(responseMock.json).toHaveBeenCalledWith(expectedResults);
    });

    it('should handle errors and return an error response if parsing fails', async () => {
      // Mocked request body with an invalid FXQL format
      const requestBody = {
        FXQL: 'USD-GBP { BUY 100 SELL 200 CAP 93800 }\n\nINVALID-FORMAT { BUY 50 SELL 70 CAP 5000 }',
      };

      // Mock the response object
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Mock the `parseMultipleFXQL` method from the service to throw an error
      jest.spyOn(userService, 'parseMultipleFXQL').mockRejectedValue(new Error('Invalid FXQL format'));

      // Call the controller method
      await userController.parseFXQL(responseMock, requestBody);

      // Assert that the status method was called with HttpStatus.BAD_REQUEST (400)
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      // Assert that the json method was called with the error message
      expect(responseMock.json).toHaveBeenCalledWith({
        error: 'Invalid FXQL format',
      });
    });
  });
});

