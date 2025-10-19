import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "react-native-paper";
import { RootStackParamList } from "../types";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentFormScreen from "../screens/PaymentFormScreen";
import PaymentSummaryScreen from "../screens/PaymentSummaryScreen";
import TransactionResultScreen from "../screens/TransactionResultScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.onPrimaryContainer,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Products" }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: "Product Details" }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: "Shopping Cart" }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: "Checkout" }}
        />
        <Stack.Screen
          name="PaymentForm"
          component={PaymentFormScreen}
          options={{ title: "Payment Details" }}
        />
        <Stack.Screen
          name="PaymentSummary"
          component={PaymentSummaryScreen}
          options={{ title: "Payment Summary" }}
        />
        <Stack.Screen
          name="TransactionResult"
          component={TransactionResultScreen}
          options={{ title: "Transaction Result" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
