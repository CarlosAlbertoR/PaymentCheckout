import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { WompiService } from '../wompi/wompi.service';
import { Transaction } from '../../entities/transaction.entity';
import { Payment } from '../../entities/payment.entity';
import { Product } from '../../entities/product.entity';
import { CreateTransactionDto } from '../../common/dto/create-transaction.dto';
import { CompletePaymentDto } from '../../common/dto/complete-payment.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let paymentRepository: Repository<Payment>;
  let productRepository: Repository<Product>;
  let wompiService: WompiService;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWompiService = {
    processPayment: jest.fn(),
    getTransactionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: WompiService,
          useValue: mockWompiService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    paymentRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    wompiService = module.get<WompiService>(WompiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const mockProduct = { id: '1', name: 'Product 1', stock: 10 };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 100,
        status: 'PENDING',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction({
        totalAmount: 100,
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      });

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.create).toHaveBeenCalled();
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw error when product is not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createTransaction({
          totalAmount: 100,
          customerInfo: { name: 'John', email: 'john@example.com' },
          products: [{ productId: 'nonexistent', quantity: 1, price: 100 }],
        }),
      ).rejects.toThrow('Product with id nonexistent not found');
    });
  });

  describe('completePayment', () => {
    it('should complete payment successfully', async () => {
      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 100,
        status: 'PENDING',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 100 }],
      };

      const mockWompiResponse = {
        data: {
          id: 'wompi-123',
          status: 'APPROVED',
        },
      };

      const mockPayment = {
        id: '1',
        transactionId: '1',
        wompiTransactionId: 'wompi-123',
        amount: 100,
        status: 'PENDING',
      };

      const mockProduct = {
        id: '1',
        name: 'Product 1',
        stock: 10,
      };

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

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockWompiService.processPayment.mockResolvedValue(mockWompiResponse);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        stock: 9,
      });

      const result = await service.completePayment(completePaymentDto);

      expect(result).toBeDefined();
      expect(mockWompiService.processPayment).toHaveBeenCalled();
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalled();
    });

    it('should throw error when transaction is not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      const completePaymentDto: CompletePaymentDto = {
        transactionId: 'nonexistent',
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

      await expect(service.completePayment(completePaymentDto)).rejects.toThrow(
        'Transaction not found',
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

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['payments'],
      });
    });

    it('should return null when transaction is not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });
});
