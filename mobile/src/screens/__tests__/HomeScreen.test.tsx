import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import HomeScreen from "../HomeScreen";
import cartSlice from "../../store/slices/cartSlice";
import productsSlice from "../../store/slices/productsSlice";
import { AppTheme } from "../../theme/AppTheme";

// No network: preload state and neutralize thunks to avoid act warnings
jest.mock("../../store/slices/productsSlice", () => {
  const actual = jest.requireActual("../../store/slices/productsSlice");
  return {
    __esModule: true,
    default: actual.default,
    setSelectedCategory: actual.setSelectedCategory,
    fetchProducts: () => ({ type: "TEST/NOOP" }),
    fetchCategories: () => ({ type: "TEST/NOOP" }),
  };
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const createMockStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      cart: cartSlice,
      products: productsSlice,
    },
    preloadedState,
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  preloadedState?: any
) => {
  const store = createMockStore(preloadedState);

  return render(
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider theme={AppTheme}>{component}</PaperProvider>
      </NavigationContainer>
    </Provider>
  );
};

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [],
        categories: [],
        selectedCategory: "all",
        loading: true,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    expect(screen.getByText("Loading catalog...")).toBeTruthy();
  });

  it("should render products after loading", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [
          {
            id: "1",
            name: "Test Product 1",
            description: "Test Description 1",
            price: 100000,
            stock: 10,
            imageUrl: "test1.jpg",
            category: "electronics",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            name: "Test Product 2",
            description: "Test Description 2",
            price: 200000,
            stock: 5,
            imageUrl: "test2.jpg",
            category: "clothing",
            createdAt: "",
            updatedAt: "",
          },
        ],
        categories: ["electronics", "clothing"],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    expect(screen.getByText("Test Product 1")).toBeTruthy();
    expect(screen.getByText("Test Product 2")).toBeTruthy();
  });

  it("should render categories", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [],
        categories: ["electronics", "clothing"],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    expect(screen.getByText("Electronics")).toBeTruthy();
    expect(screen.getByText("Clothing")).toBeTruthy();
  });

  it("should filter products by category", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [
          {
            id: "1",
            name: "Test Product 1",
            description: "Test Description 1",
            price: 100000,
            stock: 10,
            imageUrl: "test1.jpg",
            category: "electronics",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            name: "Test Product 2",
            description: "Test Description 2",
            price: 200000,
            stock: 5,
            imageUrl: "test2.jpg",
            category: "clothing",
            createdAt: "",
            updatedAt: "",
          },
        ],
        categories: ["electronics", "clothing"],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    const electronicsCategory = screen.getByText("Electronics");
    fireEvent.press(electronicsCategory);
    expect(screen.getByText("Test Product 1")).toBeTruthy();
  });

  it("should add product to cart when add button is pressed", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [
          {
            id: "1",
            name: "Test Product 1",
            description: "Test Description 1",
            price: 100000,
            stock: 10,
            imageUrl: "test1.jpg",
            category: "electronics",
            createdAt: "",
            updatedAt: "",
          },
        ],
        categories: [],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    const addButtons = screen.getAllByText("Add");
    fireEvent.press(addButtons[0]);
    // Check cart chip updates
    expect(screen.getByText(/Cart \(1\)/)).toBeTruthy();
  });

  it("should navigate to product detail when product is pressed", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [
          {
            id: "1",
            name: "Test Product 1",
            description: "Test Description 1",
            price: 100000,
            stock: 10,
            imageUrl: "test1.jpg",
            category: "electronics",
            createdAt: "",
            updatedAt: "",
          },
        ],
        categories: [],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    const product = screen.getByText("Test Product 1");
    fireEvent.press(product);
    expect(mockNavigate).toHaveBeenCalledWith("ProductDetail", {
      product: expect.objectContaining({ id: "1" }),
    });
  });

  it("should navigate to cart when cart button is pressed", () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [],
        categories: [],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    const cartChip = screen.getByText(/Cart \(0\)/);
    fireEvent.press(cartChip);
    expect(mockNavigate).toHaveBeenCalledWith("Cart");
  });

  it("should display formatted prices", async () => {
    renderWithProviders(<HomeScreen />, {
      products: {
        items: [
          {
            id: "1",
            name: "A",
            description: "d",
            price: 100000,
            stock: 1,
            imageUrl: "u",
            category: "electronics",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            name: "B",
            description: "d",
            price: 200000,
            stock: 1,
            imageUrl: "u",
            category: "clothing",
            createdAt: "",
            updatedAt: "",
          },
        ],
        categories: [],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: { items: [], total: 0 },
    });
    expect(screen.getByText("$1.000")).toBeTruthy();
    expect(screen.getByText("$2.000")).toBeTruthy();
  });
});
