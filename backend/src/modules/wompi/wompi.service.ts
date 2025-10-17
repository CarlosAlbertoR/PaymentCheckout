import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { appConfig } from '../../config/app.config';
import { ProcessPaymentDto } from '../../common/dto/payment.dto';

export interface WompiPaymentRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    installments: number;
    token: string;
  };
  reference: string;
  public_key: string;
  redirect_url?: string;
}

export interface WompiPaymentResponse {
  data: {
    id: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: any;
    };
    status: string;
    status_message: string;
    shipping_address?: any;
    redirect_url?: string;
    payment_source_id?: number;
    payment_link_id?: string;
    created_at: string;
    finalized_at?: string;
    taxes?: any[];
  };
}

@Injectable()
export class WompiService {
  private readonly baseUrl = appConfig.wompi.baseUrl;
  private readonly publicKey = appConfig.wompi.publicKey;
  private readonly privateKey = appConfig.wompi.privateKey;

  constructor(private readonly httpService: HttpService) {}

  async createPaymentToken(creditCardData: any): Promise<string> {
    try {
      const tokenRequest = {
        number: creditCardData.number,
        cvc: creditCardData.cvc,
        exp_month: parseInt(creditCardData.expiry.split('/')[0]),
        exp_year: parseInt('20' + creditCardData.expiry.split('/')[1]),
        card_holder: creditCardData.cardholderName,
        public_key: this.publicKey,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/tokens/cards`, tokenRequest),
      );

      return response.data.data.id;
    } catch (error) {
      console.error('Error creating payment token:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to create payment token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async processPayment(processPaymentDto: ProcessPaymentDto, creditCardData: any): Promise<WompiPaymentResponse> {
    try {
      // Crear token de pago
      const paymentToken = await this.createPaymentToken(creditCardData);

      // Preparar request para Wompi
      const paymentRequest: WompiPaymentRequest = {
        amount_in_cents: Math.round(processPaymentDto.amount * 100), // Convertir a centavos
        currency: processPaymentDto.currency,
        customer_email: 'test@example.com', // En producción vendría del DTO
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: paymentToken,
        },
        reference: processPaymentDto.reference,
        public_key: this.publicKey,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions`, paymentRequest),
      );

      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to process payment with Wompi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<WompiPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${transactionId}`),
      );

      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to get transaction status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Método para simular pagos en sandbox (para testing)
  async simulatePayment(processPaymentDto: ProcessPaymentDto, creditCardData: any): Promise<WompiPaymentResponse> {
    // En sandbox, podemos simular diferentes escenarios
    const isApproved = this.simulatePaymentApproval(creditCardData.number);
    
    const mockResponse: WompiPaymentResponse = {
      data: {
        id: `wompi_${Date.now()}`,
        amount_in_cents: Math.round(processPaymentDto.amount * 100),
        reference: processPaymentDto.reference,
        customer_email: 'test@example.com',
        currency: processPaymentDto.currency,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          extra: {
            bin: creditCardData.number.substring(0, 6),
            name: creditCardData.cardholderName,
            brand: this.detectCardBrand(creditCardData.number),
            exp_year: creditCardData.expiry.split('/')[1],
            exp_month: creditCardData.expiry.split('/')[0],
          },
        },
        status: isApproved ? 'APPROVED' : 'DECLINED',
        status_message: isApproved ? 'Transacción aprobada' : 'Transacción rechazada',
        created_at: new Date().toISOString(),
        finalized_at: new Date().toISOString(),
      },
    };

    return mockResponse;
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
}
