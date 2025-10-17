import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock > :stock', { stock: 0 })
      .getMany();
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

  async createSampleProducts(): Promise<void> {
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system',
        price: 999.99,
        stock: 10,
        imageUrl: 'https://example.com/iphone15.jpg',
      },
      {
        name: 'MacBook Air M2',
        description: 'Ultra-thin laptop with M2 chip',
        price: 1199.99,
        stock: 5,
        imageUrl: 'https://example.com/macbook.jpg',
      },
      {
        name: 'AirPods Pro',
        description: 'Wireless earbuds with noise cancellation',
        price: 249.99,
        stock: 20,
        imageUrl: 'https://example.com/airpods.jpg',
      },
    ];

    for (const productData of sampleProducts) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: productData.name },
      });

      if (!existingProduct) {
        const product = this.productRepository.create(productData);
        await this.productRepository.save(product);
      }
    }
  }
}
