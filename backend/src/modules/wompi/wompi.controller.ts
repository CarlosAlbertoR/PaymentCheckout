import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WompiService, type WebhookData } from './wompi.service';

@Controller('wompi')
export class WompiController {
  constructor(private readonly wompiService: WompiService) {}

  @Post('webhook')
  handleWebhook(
    @Body() webhookData: WebhookData,
    @Headers('x-wompi-signature') signature: string,
  ): { success: boolean; message: string } {
    try {
      console.log('🔔 Received Wompi webhook:', {
        event: webhookData.event,
        signature: signature ? 'present' : 'missing',
      });

      if (!signature) {
        throw new HttpException(
          'Missing webhook signature',
          HttpStatus.BAD_REQUEST,
        );
      }

      const isValid = this.wompiService.processWebhook(webhookData, signature);

      if (!isValid) {
        throw new HttpException(
          'Invalid webhook signature',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Aquí podrías actualizar el estado de la transacción en la base de datos
      // basándote en el webhook recibido
      console.log('✅ Webhook processed successfully');

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      console.error('❌ Error processing webhook:', error);
      throw new HttpException(
        error.message || 'Failed to process webhook',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
