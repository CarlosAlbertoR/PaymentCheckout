import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly httpService: HttpService,
  ) {}

  async findAll(category?: string): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.stock > :stock', { stock: 0 });

    if (category && category !== 'all') {
      query.andWhere('product.category = :category', { category });
    }

    return query.getMany();
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .getRawMany();

    return categories.map((cat) => cat.category);
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    product.stock -= quantity;
    return this.productRepository.save(product);
  }

  async syncWithFakeStoreAPI(): Promise<void> {
    try {
      // Limpiar productos existentes para evitar duplicados
      await this.productRepository.clear();

      // Obtener todos los productos primero (más rápido que por categoría)
      const allProductsResponse = await firstValueFrom(
        this.httpService.get('https://fakestoreapi.com/products'),
      );
      const allProducts = allProductsResponse.data;

      // Obtener categorías para mapear
      const categoriesResponse = await firstValueFrom(
        this.httpService.get('https://fakestoreapi.com/products/categories'),
      );
      const categories = categoriesResponse.data;

      let totalProducts = 0;

      // Procesar todos los productos
      for (const fakeProduct of allProducts) {
        // Mapear datos de FakeStoreAPI a nuestro schema
        const productData = {
          name: fakeProduct.title,
          description: fakeProduct.description,
          price: fakeProduct.price,
          stock: Math.floor(Math.random() * 50) + 1, // Stock aleatorio entre 1-50
          imageUrl: fakeProduct.image,
          category: fakeProduct.category,
        };

        const product = this.productRepository.create(productData);
        await this.productRepository.save(product);
        totalProducts++;
      }

      // Agregar productos adicionales con variaciones para llegar a ~100
      await this.addVariationsToReach100(categories);

      console.log(
        `✅ Sincronizados ${totalProducts} productos de FakeStoreAPI`,
      );
    } catch (error) {
      console.error('❌ Error sincronizando con FakeStoreAPI:', error);
      throw new Error('Failed to sync with FakeStoreAPI');
    }
  }

  private async addVariationsToReach100(categories: string[]): Promise<void> {
    // Obtener productos existentes para crear variaciones
    const existingProducts = await this.productRepository.find();
    
    if (existingProducts.length >= 100) return;

    const variationsNeeded = 100 - existingProducts.length;
    let addedVariations = 0;

    for (const product of existingProducts) {
      if (addedVariations >= variationsNeeded) break;

      // Crear variaciones del producto (diferentes colores, tamaños, etc.)
      const variations = [
        { suffix: ' - Black', priceMultiplier: 1.0 },
        { suffix: ' - White', priceMultiplier: 1.1 },
        { suffix: ' - Premium', priceMultiplier: 1.5 },
        { suffix: ' - Pro', priceMultiplier: 1.3 },
        { suffix: ' - Max', priceMultiplier: 1.8 },
      ];

      for (const variation of variations) {
        if (addedVariations >= variationsNeeded) break;

        const variationData = {
          name: product.name + variation.suffix,
          description: product.description + ` (${variation.suffix.replace(' - ', '')} version)`,
          price: product.price * variation.priceMultiplier,
          stock: Math.floor(Math.random() * 30) + 1,
          imageUrl: product.imageUrl,
          category: product.category,
        };

        const variationProduct = this.productRepository.create(variationData);
        await this.productRepository.save(variationProduct);
        addedVariations++;
      }
    }

    console.log(`✅ Agregadas ${addedVariations} variaciones de productos`);
  }

  async createSampleProducts(): Promise<void> {
    // Solo usar FakeStoreAPI
    await this.syncWithFakeStoreAPI();
  }
}
