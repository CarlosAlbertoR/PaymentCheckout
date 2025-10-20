import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getCategories: jest.fn(),
    createSampleProducts: jest.fn(),
    syncWithFakeStoreAPI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products when no category is specified', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'electronics' },
        { id: '2', name: 'Product 2', category: 'clothing' },
      ];

      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered products when category is specified', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'electronics' },
      ];

      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll('electronics');

      expect(result).toEqual(mockProducts);
      expect(mockProductsService.findAll).toHaveBeenCalledWith('electronics');
    });
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      const mockCategories = ['electronics', 'clothing'];

      mockProductsService.getCategories.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockProductsService.getCategories).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw error when product is not found', async () => {
      mockProductsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('seedProducts', () => {
    it('should create sample products', async () => {
      mockProductsService.createSampleProducts.mockResolvedValue(undefined);

      const result = await controller.seedProducts();

      expect(result).toEqual({
        message: 'Sample products created successfully',
      });
      expect(mockProductsService.createSampleProducts).toHaveBeenCalled();
    });
  });

  describe('syncWithFakeStore', () => {
    it('should sync with FakeStoreAPI', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];

      mockProductsService.syncWithFakeStoreAPI.mockResolvedValue(undefined);
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.syncWithFakeStore();

      expect(result).toEqual({
        message: 'Products synchronized with FakeStoreAPI successfully',
        count: 2,
      });
      expect(mockProductsService.syncWithFakeStoreAPI).toHaveBeenCalled();
      expect(mockProductsService.findAll).toHaveBeenCalled();
    });
  });
});
