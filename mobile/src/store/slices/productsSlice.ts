import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types";
import { getApiUrl } from "../../config/api.config";

interface ProductsState {
  items: Product[];
  categories: string[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  selectedCategory: "all",
  loading: false,
  error: null,
};

// Async thunk para obtener productos
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (category?: string) => {
    const url =
      category && category !== "all"
        ? `${getApiUrl("/products")}?category=${encodeURIComponent(category)}`
        : getApiUrl("/products");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  }
);

// Async thunk para obtener categorías
export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async () => {
    const response = await fetch(getApiUrl("/products/categories"));
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearError, setSelectedCategory } = productsSlice.actions;
export default productsSlice.reducer;
