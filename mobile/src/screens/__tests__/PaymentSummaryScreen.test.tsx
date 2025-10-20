import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import PaymentSummaryScreen from "../PaymentSummaryScreen";
import cartReducer from "../../store/slices/cartSlice";
import productsReducer from "../../store/slices/productsSlice";
import paymentReducer from "../../store/slices/paymentSlice";
import transactionReducer from "../../store/slices/transactionSlice";
import { AppTheme } from "../../theme/AppTheme";

// Mock navigation route params
const mockNav = { navigate: jest.fn(), goBack: jest.fn() };
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({
    params: { customerInfo: { name: "John", email: "john@example.com" } },
  }),
  useNavigation: () => mockNav,
}));

// Mock processPayment thunk to resolve successfully with unwrap()
jest.mock("../../store/slices/transactionSlice", () => {
  const actual = jest.requireActual("../../store/slices/transactionSlice");
  return {
    __esModule: true,
    ...actual,
    processPayment: () => () => ({
      unwrap: async () => ({
        transaction: {
          id: "t1",
          transactionNumber: "TXN-1",
          totalAmount: 100000,
          status: "COMPLETED",
          customerInfo: { name: "John", email: "john@example.com" },
          products: [
            { productId: "1", name: "Item", price: 100000, quantity: 1 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    }),
  };
});

const createStore = (preloadedState?: any) =>
  configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      payment: paymentReducer,
      transaction: transactionReducer,
    },
    preloadedState: preloadedState ?? {
      products: {
        items: [],
        categories: [],
        selectedCategory: "all",
        loading: false,
        error: null,
      },
      cart: {
        items: [{ productId: "1", name: "Item", price: 100000, quantity: 1 }],
        total: 100000,
      },
      payment: {
        creditCard: {
          number: "4242424242424242",
          cvc: "123",
          cardholderName: "John Doe",
          exp_month: "12",
          exp_year: "25",
        },
        isProcessing: false,
        error: null,
      },
      transaction: {},
    },
  });

const renderScreen = (preloadedState?: any) => {
  const store = createStore(preloadedState);
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider theme={AppTheme}>
          <PaymentSummaryScreen />
        </PaperProvider>
      </NavigationContainer>
    </Provider>
  );
};

describe("PaymentSummaryScreen", () => {
  it("renders order and masked card", () => {
    renderScreen();
    expect(screen.getByText("Order Summary")).toBeTruthy();
    expect(screen.getByText("Payment Information")).toBeTruthy();
    expect(screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 4242/)).toBeTruthy();
    expect(screen.getByText("Total:")).toBeTruthy();
  });

  it("navigates to edit payment", () => {
    renderScreen();
    fireEvent.press(screen.getByText("Edit Payment Information"));
    expect(mockNav.navigate).toHaveBeenCalledWith(
      "PaymentForm",
      expect.anything()
    );
  });

  it("confirms payment and navigates to result", async () => {
    renderScreen();

    // Use act to wrap the async operation
    await act(async () => {
      fireEvent.press(screen.getByText("Confirm and Process Payment"));
      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockNav.navigate).toHaveBeenCalledWith(
      "TransactionResult",
      expect.anything()
    );
  });
});
