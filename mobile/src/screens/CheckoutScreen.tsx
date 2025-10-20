import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, TextInput, Button, Card, Divider } from "react-native-paper";
import { RootStackParamList, CustomerInfo } from "../types";
import { RootState, AppDispatch } from "../store";
import { setCreditCard } from "../store/slices/paymentSlice";
import { formatPriceCOP, formatTotalCOP } from "../utils/currency";

type CheckoutScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Checkout"
>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      Alert.alert("Required Field", "Please enter your full name to continue");
      return false;
    }
    if (!customerInfo.email.trim()) {
      Alert.alert("Required Field", "Please enter your email address");
      return false;
    }
    if (!customerInfo.email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    // Pasar información del cliente al PaymentForm
    navigation.navigate("PaymentForm", { customerInfo });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Shipping Information</Text>

          <TextInput
            label="Full Name *"
            value={customerInfo.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email *"
            value={customerInfo.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone (optional)"
            value={customerInfo.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cartItems.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemDetails}>
                  Qty: {item.quantity} x {formatPriceCOP(item.price)}
                </Text>
              </View>
              <Text style={styles.orderItemTotal}>
                {formatPriceCOP(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatTotalCOP(total)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Button
            mode="outlined"
            icon="credit-card"
            onPress={handleContinue}
            style={styles.paymentMethodButton}
            labelStyle={styles.paymentMethodText}
          >
            Pay with Credit Card
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.footer}>
        <Card.Content>
          <Button
            mode="contained"
            icon="arrow-right"
            onPress={handleContinue}
            style={styles.continueButton}
            labelStyle={styles.continueButtonText}
          >
            Continue to Payment
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC", // Wompi background
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0", // Wompi surfaceVariant
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  orderItemDetails: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#00D4AA", // Wompi primary
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  paymentMethodButton: {
    marginTop: 16,
  },
  paymentMethodText: {
    fontSize: 16,
  },
  footer: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  continueButton: {
    // Paper Button styles are handled by the component
  },
  continueButtonText: {
    fontSize: 18,
  },
});

export default CheckoutScreen;
