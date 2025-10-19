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
  expiry: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CompletePaymentRequest {
  products: CartItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  creditCard: CreditCardInfo;
  currency: string;
  description: string;
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
  PaymentForm: undefined;
  PaymentSummary: undefined;
  TransactionResult: { transaction: Transaction };
};
