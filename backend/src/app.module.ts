import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WompiModule } from './modules/wompi/wompi.module';

@Module({
  imports: [DatabaseModule, ProductsModule, TransactionsModule, WompiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
