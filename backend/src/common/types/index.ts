export interface ProductItem {
  productId: string;
  quantity: number;
  price: number;
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

export interface WompiResponse {
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
    created_at: string;
    finalized_at?: string;
  };
}

export interface CompletePaymentResponse {
  transaction: any;
  payment: any;
  wompiResponse: WompiResponse;
}
