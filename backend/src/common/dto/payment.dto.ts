import { IsString, IsNotEmpty, IsNumber, IsOptional, Matches } from 'class-validator';

export class CreditCardDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  number: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry must be in MM/YY format' })
  expiry: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, { message: 'CVC must be 3 or 4 digits' })
  cvc: string;

  @IsString()
  @IsNotEmpty()
  cardholderName: string;
}

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
