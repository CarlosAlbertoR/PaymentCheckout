import { ApiService } from '../api.service';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService();
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 1000 },
        { id: '2', name: 'Product 2', price: 2000 },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockProducts),
      });

      const result = await apiService.getProducts();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/products', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'API Error' }),
      });

      await expect(apiService.getProducts()).rejects.toThrow('API Error');
    });
  });

  describe('getProduct', () => {
    it('should fetch single product successfully', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 1000 };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockProduct),
      });

      const result = await apiService.getProduct('1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/products/1', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'API Error' }),
      });

      await expect(apiService.getProduct('999')).rejects.toThrow('API Error');
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = ['electronics', 'clothing', 'books'];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockCategories),
      });

      const result = await apiService.getCategories();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/products/categories', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 1000,
        status: 'PENDING',
      };

      const transactionData = {
        totalAmount: 1000,
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 1000 }],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockTransaction),
      });

      const result = await apiService.createTransaction(transactionData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const mockPayment = {
        id: '1',
        transactionId: '1',
        status: 'PENDING',
        wompiResponse: { id: 'wompi-123' },
      };

      const paymentData = {
        transactionId: '1',
        totalAmount: 1000,
        currency: 'COP',
        description: 'Test payment',
        customerInfo: { name: 'John', email: 'john@example.com' },
        products: [{ productId: '1', quantity: 1, price: 1000 }],
        creditCard: {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '25',
          cvc: '123',
          cardholderName: 'John Doe',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockPayment),
      });

      const result = await apiService.processPayment(paymentData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/transactions/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
      const mockTransaction = {
        id: '1',
        transactionNumber: 'TXN-123',
        totalAmount: 1000,
        status: 'PENDING',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockTransaction),
      });

      const result = await apiService.getTransactionStatus('1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/transactions/1', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockTransaction);
    });
  });
});
