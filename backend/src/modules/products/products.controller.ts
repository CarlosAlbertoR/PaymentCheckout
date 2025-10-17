import { Controller, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
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
}
