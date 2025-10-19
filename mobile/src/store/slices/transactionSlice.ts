import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Transaction, CompletePaymentRequest } from "../../types";
import { getApiUrl } from "../../config/api.config";

interface TransactionState {
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  status: "idle" | "pending" | "completed" | "failed";
}

const initialState: TransactionState = {
  currentTransaction: null,
  loading: false,
  error: null,
  status: "idle",
};

// Async thunk para procesar pago completo
export const processPayment = createAsyncThunk(
  "transaction/processPayment",
  async (paymentData: CompletePaymentRequest) => {
    const response = await fetch(getApiUrl("/transactions/complete-payment"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Payment failed");
    }

    return response.json();
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setCurrentTransaction: (
      state,
      action: PayloadAction<Transaction | null>
    ) => {
      state.currentTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTransaction: (state) => {
      state.currentTransaction = null;
      state.loading = false;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "pending";
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.transaction;
        state.status =
          action.payload.wompiResponse.data.status === "APPROVED"
            ? "completed"
            : "failed";
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Payment failed";
        state.status = "failed";
      });
  },
});

export const { setCurrentTransaction, clearError, resetTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
