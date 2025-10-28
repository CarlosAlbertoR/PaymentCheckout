export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CreditCardInfo {
  number: string;
  exp_month: string; // MM
  exp_year: string; // YY
  cvc: string;
  cardholderName: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  customerInfo: CustomerInfo;
  products: CartItem[];
  ivaRate?: number;
  ivaAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CompletePaymentRequest {
  products: ProductItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  creditCard: CreditCardInfo;
  currency: string;
  description: string;
  ivaRate?: number;
}

export interface PaymentResponse {
  transaction: Transaction;
  payment: any;
  wompiResponse: {
    data: {
      id: string;
      status: string;
      status_message: string;
    };
  };
}

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ProductDetail: { product: Product };
  Cart: undefined;
  Checkout: undefined;
  PaymentForm: { customerInfo?: CustomerInfo };
  PaymentSummary: { customerInfo?: CustomerInfo };
  TransactionResult: { transaction: Transaction };
};
