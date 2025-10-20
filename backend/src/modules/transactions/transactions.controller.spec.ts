import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from '../../common/dto/create-transaction.dto';
import { CompletePaymentDto } from '../../common/dto/complete-payment.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    completePayment: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        totalAmount: 100,
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      };

      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 100,
        status: 'PENDING',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      };

      mockTransactionsService.createTransaction.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.createTransaction(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.createTransaction).toHaveBeenCalledWith(
        createTransactionDto,
      );
    });
  });

  describe('processPayment', () => {
    it('should process payment', async () => {
      const completePaymentDto: CompletePaymentDto = {
        transactionId: '1',
        totalAmount: 100,
        currency: 'COP',
        description: 'Test payment',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
        creditCard: {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '25',
          cvc: '123',
          cardholderName: 'John Doe',
        },
      };

      const mockPaymentResult = {
        id: '1',
        transactionId: '1',
        status: 'PENDING',
        wompiResponse: { id: 'wompi-123' },
      };

      mockTransactionsService.processPayment.mockResolvedValue(
        mockPaymentResult,
      );

      const result = await controller.processPayment(completePaymentDto);

      expect(result).toEqual(mockPaymentResult);
      expect(mockTransactionsService.processPayment).toHaveBeenCalledWith(
        completePaymentDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return transaction by id', async () => {
      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 100,
        status: 'PENDING',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      };

      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith('1');
    });
  });
});
