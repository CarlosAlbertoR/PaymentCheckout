import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { appConfig } from '../../config/app.config';
import { ProcessPaymentDto } from '../../common/dto/payment.dto';
import * as crypto from 'crypto';

export interface CreditCardData {
  number: string;
  cvc: string;
  exp_month: string; // MM
  exp_year: string; // YY
  cardholderName: string;
}

export interface WebhookData {
  event: string;
  data: any;
}

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
  acceptance_token: string;
  signature: string;
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
  private readonly integrityKey = appConfig.wompi.integrityKey;

  constructor(private readonly httpService: HttpService) {}

  private generateSignature(data: any): string {
    try {
      // Crear string de datos ordenados alfabéticamente
      const sortedKeys = Object.keys(data).sort();
      const dataString = sortedKeys.map((key) => `${key}${data[key]}`).join('');

      // Generar HMAC SHA256
      const signature = crypto
        .createHmac('sha256', this.integrityKey)
        .update(dataString)
        .digest('hex');

      console.log('🔐 Generated signature for data:', {
        dataString: dataString.substring(0, 50) + '...',
        signature: signature.substring(0, 20) + '...',
      });

      return signature;
    } catch (error) {
      console.error('❌ Error generating signature:', error);
      throw new Error('Failed to generate signature');
    }
  }

  async getAcceptanceToken(): Promise<string> {
    try {
      console.log('🔑 Getting acceptance token from Wompi...');

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/merchants/${this.publicKey}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      );

      console.log('📥 Acceptance token response:', response.data);

      if (!response.data?.data?.presigned_acceptance?.acceptance_token) {
        throw new Error('Invalid acceptance token response from Wompi');
      }

      const acceptanceToken =
        response.data.data.presigned_acceptance.acceptance_token;
      console.log('✅ Acceptance token obtained successfully');
      return acceptanceToken;
    } catch (error: any) {
      console.error(
        '❌ Error getting acceptance token:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        `Failed to get acceptance token: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createPaymentToken(creditCardData: CreditCardData): Promise<string> {
    try {
      // Para tokens, solo enviamos los datos de la tarjeta (sin public_key en el body)
      const tokenRequest = {
        number: creditCardData.number,
        cvc: creditCardData.cvc,
        exp_month: creditCardData.exp_month, // Ya viene separado del frontend
        exp_year: creditCardData.exp_year, // Ya viene separado del frontend
        card_holder: creditCardData.cardholderName,
      };

      console.log('🔐 Creating payment token with Wompi...');
      console.log('📤 Token request:', {
        number: tokenRequest.number.substring(0, 4) + '****',
        exp_month: tokenRequest.exp_month,
        exp_year: tokenRequest.exp_year,
        card_holder: tokenRequest.card_holder,
      });

      // Para tokens, usamos la clave pública en el header de autorización
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/tokens/cards`, tokenRequest, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.publicKey}`,
          },
        }),
      );

      console.log('📥 Token response:', response.data);

      if (!response.data?.data?.id) {
        throw new Error('Invalid token response from Wompi');
      }

      console.log('✅ Payment token created successfully');
      return response.data.data.id as string;
    } catch (error: any) {
      console.error(
        '❌ Error creating payment token:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        `Failed to create payment token: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async processPayment(
    processPaymentDto: ProcessPaymentDto,
    creditCardData: CreditCardData,
  ): Promise<WompiPaymentResponse> {
    try {
      console.log('💳 Processing payment with Wompi...');

      // Validar monto mínimo (1000 centavos = $10.00 COP)
      const minimumAmount = 1000;
      const amountInCents = Math.round(processPaymentDto.amount);

      if (amountInCents < minimumAmount) {
        throw new HttpException(
          `Amount too low. Minimum amount is ${minimumAmount} centavos ($${minimumAmount / 100} COP)`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Obtener acceptance token
      const acceptanceToken = await this.getAcceptanceToken();

      // Crear token de pago
      const paymentToken = await this.createPaymentToken(creditCardData);

      // Generar signature para validar integridad
      const signature = this.generateSignature({
        amount_in_cents: amountInCents,
        currency: processPaymentDto.currency,
        reference: processPaymentDto.reference,
        public_key: this.publicKey,
        acceptance_token: acceptanceToken,
      });

      // Preparar request para Wompi
      const paymentRequest: WompiPaymentRequest = {
        amount_in_cents: amountInCents,
        currency: processPaymentDto.currency,
        customer_email: 'test@example.com', // En producción vendría del DTO
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: paymentToken,
        },
        reference: processPaymentDto.reference,
        public_key: this.publicKey,
        acceptance_token: acceptanceToken, // Token de aceptación dinámico
        signature: signature,
      };

      console.log('📤 Sending payment request to Wompi:', {
        amount_in_cents: paymentRequest.amount_in_cents,
        currency: paymentRequest.currency,
        reference: paymentRequest.reference,
      });

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions`, paymentRequest, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );

      console.log('✅ Payment processed successfully:', response.data.data.id);
      return response.data as WompiPaymentResponse;
    } catch (error: any) {
      console.error(
        '❌ Error processing payment:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        `Failed to process payment with Wompi: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactionStatus(
    transactionId: string,
  ): Promise<WompiPaymentResponse> {
    try {
      console.log(`🔍 Getting transaction status for: ${transactionId}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${transactionId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );

      console.log(
        '✅ Transaction status retrieved:',
        response.data.data.status,
      );
      return response.data as WompiPaymentResponse;
    } catch (error: any) {
      console.error(
        '❌ Error getting transaction status:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        `Failed to get transaction status: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Método para simular pagos en sandbox (para testing)
  simulatePayment(
    processPaymentDto: ProcessPaymentDto,
    creditCardData: CreditCardData,
  ): WompiPaymentResponse {
    // En sandbox, podemos simular diferentes escenarios
    const isApproved = this.simulatePaymentApproval(creditCardData.number);

    const mockResponse: WompiPaymentResponse = {
      data: {
        id: `wompi_${Date.now()}`,
        amount_in_cents: Math.round(processPaymentDto.amount),
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
            exp_year: creditCardData.exp_year,
            exp_month: creditCardData.exp_month,
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

  /**
   * Valida la integridad de la respuesta de Wompi usando la integrity key
   */
  private validateWompiIntegrity(data: any, signature: string): boolean {
    try {
      const dataString = JSON.stringify(data);
      const expectedSignature = crypto
        .createHmac('sha256', this.integrityKey)
        .update(dataString)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('❌ Error validating Wompi integrity:', error);
      return false;
    }
  }

  /**
   * Procesa webhook de Wompi para actualizar estado de transacción
   */
  processWebhook(webhookData: WebhookData, signature: string): boolean {
    try {
      console.log('🔔 Processing Wompi webhook...');

      // Validar integridad del webhook
      if (!this.validateWompiIntegrity(webhookData, signature)) {
        console.error('❌ Invalid webhook signature');
        return false;
      }

      console.log('✅ Webhook signature validated');
      console.log('📊 Webhook data:', {
        event: webhookData.event,
        data: webhookData.data,
      });

      return true;
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return false;
    }
  }
}
