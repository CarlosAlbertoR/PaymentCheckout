import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionNumber: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @Column('jsonb', { nullable: true })
  customerInfo: any;

  @Column('jsonb', { nullable: true })
  products: any[];

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 19.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  ivaRate: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  ivaAmount: number;

  @OneToMany(() => Payment, (payment) => payment.transaction)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
