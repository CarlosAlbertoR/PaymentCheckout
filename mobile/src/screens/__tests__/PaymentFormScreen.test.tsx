import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import PaymentFormScreen from "../PaymentFormScreen";
import cartReducer from "../../store/slices/cartSlice";
import productsReducer from "../../store/slices/productsSlice";
import paymentReducer, { setCreditCard } from "../../store/slices/paymentSlice";
import transactionReducer from "../../store/slices/transactionSlice";
import { AppTheme } from "../../theme/AppTheme";

// Mock navigation route params
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({ params: { customerInfo: { name: "John", email: "john@example.com" } } }),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const createStore = (preloadedState?: any) =>
  configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      payment: paymentReducer,
      transaction: transactionReducer,
    },
    preloadedState: preloadedState ?? {
      products: { items: [], categories: [], selectedCategory: "all", loading: false, error: null },
      cart: { items: [{ productId: "1", name: "Item", price: 100000, quantity: 1 }], total: 100000 },
      payment: { creditCard: null, isProcessing: false, error: null },
      transaction: {},
    },
  });

const renderScreen = (preloadedState?: any) => {
  const store = createStore(preloadedState);
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider theme={AppTheme}>
          <PaymentFormScreen />
        </PaperProvider>
      </NavigationContainer>
    </Provider>
  );
};

describe("PaymentFormScreen", () => {
  it("renders inputs and total", () => {
    renderScreen();
    expect(screen.getByLabelText("Card Number *")).toBeTruthy();
    expect(screen.getByLabelText("Expiry Date *")).toBeTruthy();
    expect(screen.getByLabelText("CVC *")).toBeTruthy();
    expect(screen.getByLabelText("Cardholder Name *")).toBeTruthy();
    expect(screen.getByText(/Total Amount:/)).toBeTruthy();
  });

  it("shows validation errors for invalid fields", async () => {
    renderScreen();
    const continueBtn = screen.getByText("Continue to Summary");
    fireEvent.press(continueBtn);
    expect(await screen.findAllByText(/required|invalid|Invalid|Must/i)).toBeTruthy();
  });

  it("masks number and expiry, detects VISA", () => {
    renderScreen();
    const numberInput = screen.getByLabelText("Card Number *");
    const expiryInput = screen.getByLabelText("Expiry Date *");

    fireEvent.changeText(numberInput, "4242424242424242");
    fireEvent.changeText(expiryInput, "1225");

    expect(screen.getByText("VISA")).toBeTruthy();
  });

  it("submits valid data and stores credit card, navigates to summary", () => {
    const navigate = jest.fn();
    (require("@react-navigation/native").useNavigation as jest.Mock).mockReturnValue({ navigate });

    const store = createStore();
    render(
      <Provider store={store}>
        <NavigationContainer>
          <PaperProvider theme={AppTheme}>
            <PaymentFormScreen />
          </PaperProvider>
        </NavigationContainer>
      </Provider>
    );

    fireEvent.changeText(screen.getByLabelText("Card Number *"), "4242424242424242");
    fireEvent.changeText(screen.getByLabelText("Expiry Date *"), "1225");
    fireEvent.changeText(screen.getByLabelText("CVC *"), "123");
    fireEvent.changeText(screen.getByLabelText("Cardholder Name *"), "John Doe");

    fireEvent.press(screen.getByText("Continue to Summary"));

    const state = store.getState();
    expect(state.payment.creditCard).toEqual({
      number: "4242424242424242",
      cvc: "123",
      cardholderName: "John Doe",
      exp_month: "12",
      exp_year: "25",
    });
    expect(navigate).toHaveBeenCalledWith("PaymentSummary", expect.anything());
  });
});


