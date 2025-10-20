import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let httpService: HttpService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    httpService = module.get<HttpService>(HttpService);
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

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.stock > :stock',
        { stock: 0 },
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should return filtered products when category is specified', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'electronics' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll('electronics');

      expect(result).toEqual(mockProducts);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.category = :category',
        { category: 'electronics' },
      );
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockCategories = [
        { category: 'electronics' },
        { category: 'clothing' },
        { category: 'electronics' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCategories),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCategories();

      expect(result).toEqual(['electronics', 'clothing', 'electronics']);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when product is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should update stock when product exists and has sufficient stock', async () => {
      const mockProduct = { id: '1', name: 'Product 1', stock: 10 };
      const updatedProduct = { ...mockProduct, stock: 8 };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateStock('1', 2);

      expect(result).toEqual(updatedProduct);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockProduct,
        stock: 8,
      });
    });

    it('should throw error when product is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStock('nonexistent', 2)).rejects.toThrow(
        'Product not found',
      );
    });

    it('should throw error when insufficient stock', async () => {
      const mockProduct = { id: '1', name: 'Product 1', stock: 5 };
      mockRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.updateStock('1', 10)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });

  describe('syncWithFakeStoreAPI', () => {
    it('should sync products from FakeStoreAPI', async () => {
      const mockFakeProducts = [
        {
          title: 'Product 1',
          description: 'Desc 1',
          price: 10.99,
          image: 'img1.jpg',
          category: 'electronics',
        },
        {
          title: 'Product 2',
          description: 'Desc 2',
          price: 20.99,
          image: 'img2.jpg',
          category: 'clothing',
        },
      ];

      const mockCategories = ['electronics', 'clothing'];

      mockHttpService.get
        .mockReturnValueOnce(of({ data: mockFakeProducts }))
        .mockReturnValueOnce(of({ data: mockCategories }));

      mockRepository.clear.mockResolvedValue(undefined);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});
      mockRepository.find.mockResolvedValue([]);

      await service.syncWithFakeStoreAPI();

      expect(mockRepository.clear).toHaveBeenCalled();
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products',
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/categories',
      );
    });

    it('should handle API errors', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      await expect(service.syncWithFakeStoreAPI()).rejects.toThrow(
        'Failed to sync with FakeStoreAPI',
      );
    });
  });

  describe('createSampleProducts', () => {
    it('should call syncWithFakeStoreAPI', async () => {
      const syncSpy = jest
        .spyOn(service, 'syncWithFakeStoreAPI')
        .mockResolvedValue(undefined);

      await service.createSampleProducts();

      expect(syncSpy).toHaveBeenCalled();
    });
  });
});
