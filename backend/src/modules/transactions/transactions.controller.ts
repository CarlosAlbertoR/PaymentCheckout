import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from '../../common/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../common/dto/payment.dto';
import { CompletePaymentDto } from '../../common/dto/complete-payment.dto';
import { Transaction } from '../../entities/transaction.entity';
import { Payment } from '../../entities/payment.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    try {
      return await this.transactionsService.createTransaction(createTransactionDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    const transaction = await this.transactionsService.findOne(id);
    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
    return transaction;
  }

  @Get('number/:transactionNumber')
  async findByTransactionNumber(@Param('transactionNumber') transactionNumber: string): Promise<Transaction> {
    const transaction = await this.transactionsService.findByTransactionNumber(transactionNumber);
    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
    return transaction;
  }

  @Post('payment')
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    try {
      return await this.transactionsService.processPayment(processPaymentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('complete-payment')
  async completePayment(@Body() completePaymentDto: CompletePaymentDto): Promise<{ transaction: Transaction; payment: Payment; wompiResponse: any }> {
    try {
      return await this.transactionsService.completePayment(completePaymentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to complete payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('payment/:paymentId/status')
  async updatePaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body() body: { status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'; wompiResponse?: any },
  ): Promise<Payment> {
    try {
      return await this.transactionsService.updatePaymentStatus(
        paymentId,
        body.status,
        body.wompiResponse,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update payment status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
