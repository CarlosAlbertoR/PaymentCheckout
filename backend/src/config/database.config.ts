import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';
import { Payment } from '../entities/payment.entity';
import { appConfig } from './app.config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  entities: [Product, Transaction, Payment],
  synchronize: appConfig.app.nodeEnv !== 'production', // Solo en desarrollo
  logging: appConfig.app.nodeEnv === 'development',
  ssl: false,
};
