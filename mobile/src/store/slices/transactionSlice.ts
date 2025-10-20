import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Transaction, CompletePaymentRequest } from "../../types";
import { apiService } from "../../services/api.service";
import { checkBackendConnection } from "../../utils/backendCheck";

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
  async (paymentData: CompletePaymentRequest, { rejectWithValue }) => {
    try {
      console.log("🚀 Sending payment request...");
      console.log("📦 Payment data:", paymentData);

      // Verificar conectividad primero
      const connectionCheck = await checkBackendConnection();
      if (!connectionCheck.isConnected) {
        console.error("❌ Backend connection failed:", connectionCheck.error);
        return rejectWithValue(
          connectionCheck.error ||
            "Backend server is not available. Please check your connection."
        );
      }
      console.log("✅ Backend is reachable");

      const result = await apiService.processPayment(paymentData);
      console.log("✅ Payment result:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Payment Error:", error);
      return rejectWithValue(error.message || "Payment processing failed");
    }
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
        const payload = action.payload as any;
        state.currentTransaction = payload.transaction;
        state.status =
          payload.wompiResponse?.data?.status === "APPROVED"
            ? "completed"
            : "failed";
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Payment failed";
        state.status = "failed";
      });
  },
});

export const { setCurrentTransaction, clearError, resetTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
