import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import paymentReducer from "./slices/paymentSlice";
import transactionReducer from "./slices/transactionSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    payment: paymentReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
