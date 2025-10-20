import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { WompiService } from './wompi.service';
import { appConfig } from '../../config/app.config';

describe('WompiService', () => {
  let service: WompiService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<WompiService>(WompiService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentToken', () => {
    it('should create payment token successfully', async () => {
      const mockTokenResponse = {
        data: {
          data: {
            id: 'token-123',
          },
        },
      };

      const creditCardData = {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        cvc: '123',
        cardholderName: 'John Doe',
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));

      const result = await service.createPaymentToken(creditCardData);

      expect(result).toBe('token-123');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${appConfig.wompi.baseUrl}/tokens/cards`,
        {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '25',
          cvc: '123',
          card_holder: 'John Doe',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${appConfig.wompi.publicKey}`,
          },
        },
      );
    });

    it('should handle API errors', async () => {
      const creditCardData = {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        cvc: '123',
        cardholderName: 'John Doe',
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: {
            data: { error: { message: 'Invalid card' } },
          },
        })),
      );

      await expect(service.createPaymentToken(creditCardData)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAcceptanceToken', () => {
    it('should get acceptance token successfully', async () => {
      const mockAcceptanceResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'acceptance-token-123',
            },
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockAcceptanceResponse));

      const result = await service.getAcceptanceToken();

      expect(result).toBe('acceptance-token-123');
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${appConfig.wompi.baseUrl}/merchants/${appConfig.wompi.publicKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    });

    it('should handle acceptance token errors', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: {
            data: { error: { message: 'Merchant not found' } },
          },
        })),
      );

      await expect(service.getAcceptanceToken()).rejects.toThrow(HttpException);
    });
  });

  describe('generateSignature', () => {
    it('should generate valid signature', () => {
      const data = {
        amount_in_cents: 1000,
        currency: 'COP',
        reference: 'TXN-123',
        public_key: 'pub_key',
        acceptance_token: 'acceptance_token',
      };

      const signature = (service as any).generateSignature(data);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex length
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const mockAcceptanceResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'acceptance-token-123',
            },
          },
        },
      };

      const mockPaymentResponse = {
        data: {
          data: {
            id: 'wompi-transaction-123',
            status: 'APPROVED',
          },
        },
      };

      const processPaymentDto = {
        transactionId: '1',
        amount: 1000,
        currency: 'COP',
        reference: 'TXN-123',
        description: 'Test payment',
      };

      const creditCardData = {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        cvc: '123',
        cardholderName: 'John Doe',
      };

      // Mock acceptance token call
      mockHttpService.get.mockReturnValue(of(mockAcceptanceResponse));

      // Mock payment token call
      mockHttpService.post
        .mockReturnValueOnce(of({ data: { data: { id: 'token-123' } } }))
        .mockReturnValueOnce(of(mockPaymentResponse));

      const result = await service.processPayment(
        processPaymentDto,
        creditCardData,
      );

      expect(result).toEqual(mockPaymentResponse.data);
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockHttpService.post).toHaveBeenCalledTimes(2);
    });

    it('should throw error for amount too low', async () => {
      const processPaymentDto = {
        transactionId: '1',
        amount: 500, // Below minimum
        currency: 'COP',
        reference: 'TXN-123',
        description: 'Test payment',
      };

      const creditCardData = {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        cvc: '123',
        cardholderName: 'John Doe',
      };

      await expect(
        service.processPayment(processPaymentDto, creditCardData),
      ).rejects.toThrow(
        'Failed to process payment with Wompi: Amount too low. Minimum amount is 1000 centavos ($10 COP)',
      );
    });

    it('should handle payment processing errors', async () => {
      const processPaymentDto = {
        transactionId: '1',
        amount: 1000,
        currency: 'COP',
        reference: 'TXN-123',
        description: 'Test payment',
      };

      const creditCardData = {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        cvc: '123',
        cardholderName: 'John Doe',
      };

      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: {
            data: { error: { message: 'Acceptance token error' } },
          },
        })),
      );

      await expect(
        service.processPayment(processPaymentDto, creditCardData),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
      const mockStatusResponse = {
        data: {
          data: {
            id: 'wompi-transaction-123',
            status: 'APPROVED',
            amount_in_cents: 1000,
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockStatusResponse));

      const result = await service.getTransactionStatus(
        'wompi-transaction-123',
      );

      expect(result).toEqual(mockStatusResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${appConfig.wompi.baseUrl}/transactions/wompi-transaction-123`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${appConfig.wompi.privateKey}`,
          },
        },
      );
    });

    it('should handle status check errors', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: {
            data: { error: { message: 'Transaction not found' } },
          },
        })),
      );

      await expect(service.getTransactionStatus('nonexistent')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
