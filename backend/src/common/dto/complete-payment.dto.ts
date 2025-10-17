import { IsArray, IsNotEmpty, IsString, IsNumber, ValidateNested, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

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

export class CompletePaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
