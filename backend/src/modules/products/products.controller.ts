import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('category') category?: string): Promise<Product[]> {
    return this.productsService.findAll(category);
  }

  @Get('categories')
  async getCategories(): Promise<string[]> {
    return this.productsService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @Post('seed')
  async seedProducts(): Promise<{ message: string }> {
    await this.productsService.createSampleProducts();
    return { message: 'Sample products created successfully' };
  }

  @Post('sync-fakestore')
  async syncWithFakeStore(): Promise<{ message: string; count: number }> {
    await this.productsService.syncWithFakeStoreAPI();
    const products = await this.productsService.findAll();
    return {
      message: 'Products synchronized with FakeStoreAPI successfully',
      count: products.length,
    };
  }
}
