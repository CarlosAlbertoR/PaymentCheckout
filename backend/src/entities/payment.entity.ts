import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column({ nullable: true })
  wompiTransactionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

  @Column('jsonb', { nullable: true })
  wompiResponse: any;

  @Column('jsonb', { nullable: true })
  creditCardInfo: any;

  @ManyToOne(() => Transaction, (transaction) => transaction.payments)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
