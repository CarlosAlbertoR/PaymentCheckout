import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../../types";

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        console.log(
          `🔄 Replacing quantity for ${action.payload.name}: ${existingItem.quantity} → ${action.payload.quantity}`
        );
        // Reemplazar la cantidad en lugar de sumarla
        existingItem.quantity = action.payload.quantity;
      } else {
        console.log(
          `➕ Adding new item to cart: ${action.payload.name} (${action.payload.quantity})`
        );
        state.items.push(action.payload);
      }

      // Recalcular total
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    addQuantityToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        console.log(
          `➕ Adding quantity for ${action.payload.name}: ${
            existingItem.quantity
          } + ${action.payload.quantity} = ${
            existingItem.quantity + action.payload.quantity
          }`
        );
        // Sumar la cantidad (para botones "Add" rápidos)
        existingItem.quantity += action.payload.quantity;
      } else {
        console.log(
          `➕ Adding new item to cart: ${action.payload.name} (${action.payload.quantity})`
        );
        state.items.push(action.payload);
      }

      // Recalcular total
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );

      // Recalcular total
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;

        // Recalcular total
        state.total = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const {
  addToCart,
  addQuantityToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
