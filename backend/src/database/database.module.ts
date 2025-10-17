import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../config/database.config';
import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';
import { Payment } from '../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Product, Transaction, Payment]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
