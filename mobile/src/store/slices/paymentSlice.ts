import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CreditCardInfo } from "../../types";

interface PaymentState {
  creditCard: CreditCardInfo | null;
  isProcessing: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  creditCard: null,
  isProcessing: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setCreditCard: (state, action: PayloadAction<CreditCardInfo>) => {
      state.creditCard = action.payload;
      state.error = null;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearPayment: (state) => {
      state.creditCard = null;
      state.isProcessing = false;
      state.error = null;
    },
  },
});

export const { setCreditCard, setProcessing, setError, clearPayment } =
  paymentSlice.actions;
export default paymentSlice.reducer;
