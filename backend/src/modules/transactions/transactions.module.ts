import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../../entities/transaction.entity';
import { Payment } from '../../entities/payment.entity';
import { Product } from '../../entities/product.entity';
import { WompiModule } from '../wompi/wompi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Payment, Product]),
    WompiModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
