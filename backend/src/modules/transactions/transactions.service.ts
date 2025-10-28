import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Payment } from '../../entities/payment.entity';
import { Product } from '../../entities/product.entity';
import { CreateTransactionDto } from '../../common/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../common/dto/payment.dto';
import { CompletePaymentDto } from '../../common/dto/complete-payment.dto';
import { ProductItem } from '../../common/types';
import { WompiService } from '../wompi/wompi.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly wompiService: WompiService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto & { ivaRate?: number },
  ): Promise<Transaction> {
    // Validar stock antes de crear la transacción
    await this.validateStock(createTransactionDto.products);

    // Generar número de transacción único
    const transactionNumber = this.generateTransactionNumber();

    // Calcular IVA (por defecto 19%)
    const ivaRate = createTransactionDto.ivaRate ?? 19;
    const ivaAmount = parseFloat(
      ((createTransactionDto.totalAmount * ivaRate) / 100).toFixed(2),
    );

    // Crear la transacción
    const transaction = this.transactionRepository.create({
      transactionNumber,
      totalAmount: createTransactionDto.totalAmount,
      status: 'PENDING',
      customerInfo: createTransactionDto.customerInfo,
      products: createTransactionDto.products,
      ivaRate,
      ivaAmount,
    });

    return this.transactionRepository.save(transaction);
  }

  findOne(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['payments'],
    });
  }

  findByTransactionNumber(
    transactionNumber: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { transactionNumber },
      relations: ['payments'],
    });
  }

  async updateTransactionStatus(
    id: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    transaction.status = status;
    return this.transactionRepository.save(transaction);
  }

  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    const transaction = await this.findOne(processPaymentDto.transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction is not in pending status');
    }

    // Crear el pago
    const payment = this.paymentRepository.create({
      transactionId: processPaymentDto.transactionId,
      amount: processPaymentDto.amount,
      status: 'PENDING',
    });

    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR',
    wompiResponse?: any,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    if (wompiResponse) {
      payment.wompiResponse = wompiResponse;
      payment.wompiTransactionId =
        wompiResponse.id || wompiResponse.transaction_id;
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    // Actualizar el stock de productos si el pago fue aprobado
    if (status === 'APPROVED') {
      await this.updateProductStock(updatedPayment.transactionId);
      await this.updateTransactionStatus(
        updatedPayment.transactionId,
        'COMPLETED',
      );
    } else if (status === 'DECLINED' || status === 'ERROR') {
      await this.updateTransactionStatus(
        updatedPayment.transactionId,
        'FAILED',
      );
    }

    return updatedPayment;
  }

  private async updateProductStock(transactionId: string): Promise<void> {
    const transaction = await this.findOne(transactionId);
    if (!transaction || !transaction.products) {
      return;
    }

    for (const productItem of transaction.products) {
      const product = await this.productRepository.findOne({
        where: { id: productItem.productId },
      });
      if (product && product.stock >= productItem.quantity) {
        product.stock -= productItem.quantity;
        await this.productRepository.save(product);
      }
    }
  }

  private async validateStock(products: any[]): Promise<void> {
    for (const productItem of products) {
      const product = await this.productRepository.findOne({
        where: { id: productItem.productId },
      });

      if (!product) {
        throw new Error(`Product with id ${productItem.productId} not found`);
      }

      if (product.stock < productItem.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${productItem.quantity}`,
        );
      }
    }
  }

  async completePayment(completePaymentDto: CompletePaymentDto): Promise<{
    transaction: Transaction;
    payment: Payment;
    wompiResponse: any;
  }> {
    // 1. Crear transacción
    const createTransactionDto = {
      products: completePaymentDto.products,
      customerInfo: completePaymentDto.customerInfo,
      totalAmount: completePaymentDto.totalAmount,
      ivaRate: completePaymentDto.ivaRate ?? 19,
    };

    const transaction = await this.createTransaction(createTransactionDto);

    // 2. Crear pago
    const payment = await this.processPayment({
      transactionId: transaction.id,
      amount: completePaymentDto.totalAmount,
      currency: completePaymentDto.currency,
      reference: transaction.transactionNumber,
      description: completePaymentDto.description,
    });

    // 3. Usar CreditCardDto directamente (ya tiene exp_month y exp_year)
    const creditCardData = {
      number: completePaymentDto.creditCard.number,
      cvc: completePaymentDto.creditCard.cvc,
      exp_month: completePaymentDto.creditCard.exp_month,
      exp_year: completePaymentDto.creditCard.exp_year,
      cardholderName: completePaymentDto.creditCard.cardholderName,
    };

    // 4. Procesar con Wompi (integración real)
    const wompiResponse = await this.wompiService.processPayment(
      {
        transactionId: transaction.id,
        amount: completePaymentDto.totalAmount,
        currency: completePaymentDto.currency,
        reference: transaction.transactionNumber,
        description: completePaymentDto.description,
      },
      creditCardData,
    );

    // 5. Actualizar estado del pago
    const updatedPayment = await this.updatePaymentStatus(
      payment.id,
      wompiResponse.data.status === 'APPROVED' ? 'APPROVED' : 'DECLINED',
      wompiResponse,
    );

    // 5. Si el pago fue aprobado, actualizar stock y estado de transacción
    if (wompiResponse.data.status === 'APPROVED') {
      await this.updateStockAfterPayment(completePaymentDto.products);
      await this.updateTransactionStatus(transaction.id, 'COMPLETED');
      console.log(
        '✅ Payment approved - Stock updated and transaction completed',
      );
    } else {
      await this.updateTransactionStatus(transaction.id, 'FAILED');
      console.log('❌ Payment declined - Transaction marked as failed');
    }

    return {
      transaction,
      payment: updatedPayment,
      wompiResponse,
    };
  }

  private simulateWompiPayment(
    completePaymentDto: CompletePaymentDto,
    reference: string,
  ): any {
    // Simular respuesta de Wompi para sandbox
    const isApproved = this.simulatePaymentApproval(
      completePaymentDto.creditCard.number,
    );

    return {
      data: {
        id: `wompi_${Date.now()}`,
        amount_in_cents: Math.round(completePaymentDto.totalAmount * 100),
        reference,
        customer_email: completePaymentDto.customerInfo.email,
        currency: completePaymentDto.currency,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          extra: {
            bin: completePaymentDto.creditCard.number.substring(0, 6),
            name: completePaymentDto.creditCard.cardholderName,
            brand: this.detectCardBrand(completePaymentDto.creditCard.number),
            exp_year: completePaymentDto.creditCard.exp_year,
            exp_month: completePaymentDto.creditCard.exp_month,
          },
        },
        status: isApproved ? 'APPROVED' : 'DECLINED',
        status_message: isApproved
          ? 'Transacción aprobada'
          : 'Transacción rechazada',
        created_at: new Date().toISOString(),
        finalized_at: new Date().toISOString(),
      },
    };
  }

  private simulatePaymentApproval(cardNumber: string): boolean {
    // Simular aprobación basada en el número de tarjeta
    // Tarjetas que terminan en número par = aprobadas
    const lastDigit = parseInt(cardNumber.slice(-1));
    return lastDigit % 2 === 0;
  }

  private detectCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) {
      return 'VISA';
    } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
      return 'MASTERCARD';
    } else if (cardNumber.startsWith('3')) {
      return 'AMEX';
    }
    return 'UNKNOWN';
  }

  private generateTransactionNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Actualiza el stock después de un pago exitoso
   */
  private async updateStockAfterPayment(
    products: ProductItem[],
  ): Promise<void> {
    for (const productItem of products) {
      const product = await this.productRepository.findOne({
        where: { id: productItem.productId },
      });

      if (product) {
        product.stock -= productItem.quantity;
        await this.productRepository.save(product);
        console.log(
          `📦 Updated stock for ${product.name}: -${productItem.quantity} (new stock: ${product.stock})`,
        );
      }
    }
  }
}
