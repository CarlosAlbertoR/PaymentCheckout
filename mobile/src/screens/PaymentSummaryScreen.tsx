import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, Divider } from "react-native-paper";
import { RootStackParamList } from "../types";
import { RootState, AppDispatch } from "../store";
import { setCreditCard } from "../store/slices/paymentSlice";

type PaymentSummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentSummary"
>;

const PaymentSummaryScreen: React.FC = () => {
  const navigation = useNavigation<PaymentSummaryScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );
  const { creditCard } = useSelector((state: RootState) => state.payment);

  const handleConfirmPayment = () => {
    if (!creditCard) {
      Alert.alert(
        "Missing Information",
        "Please enter your payment details first"
      );
      return;
    }

    // Navigate to payment form to process
    navigation.navigate("PaymentForm");
  };

  const handleEditPayment = () => {
    navigation.navigate("PaymentForm");
  };

  const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return "**** **** **** ****";
    const cleaned = cardNumber.replace(/\s/g, "");
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.orderCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cartItems.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemDetails}>
                  Qty: {item.quantity} x ${item.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.orderItemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.paymentCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Card:</Text>
              <Chip icon="credit-card" style={styles.cardChip}>
                {maskCardNumber(creditCard?.number || "")}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cardholder:</Text>
              <Text style={styles.paymentValue}>
                {creditCard?.cardholderName || "Not specified"}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Expires:</Text>
              <Text style={styles.paymentValue}>
                {creditCard?.expiry || "Not specified"}
              </Text>
            </View>
          </View>

          <Button
            mode="outlined"
            icon="pencil"
            onPress={handleEditPayment}
            style={styles.editButton}
          >
            Edit Payment Information
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.termsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>

          <Text style={styles.termsText}>
            By proceeding with payment, you agree to our terms and conditions.
            Your information is protected with SSL encryption and will not be
            shared with third parties.
          </Text>

          <Chip icon="shield-check" style={styles.securityChip}>
            Secure transaction protected by SSL
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.footerCard}>
        <Card.Content>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="credit-card"
              onPress={handleConfirmPayment}
              style={styles.confirmButton}
            >
              Confirm and Process Payment
            </Button>

            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
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
  orderCard: {
    margin: 16,
    elevation: 2,
  },
  paymentCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  termsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  paymentInfo: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  cardChip: {
    backgroundColor: "#00D4AA", // Wompi primary
  },
  editButton: {
    marginTop: 16,
  },
  termsText: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
    lineHeight: 20,
    marginBottom: 16,
  },
  securityChip: {
    backgroundColor: "#E6FFFA", // Wompi primary container
  },
  footerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  buttonContainer: {
    gap: 12,
  },
  confirmButton: {
    // Paper Button styles are handled by the component
  },
  cancelButton: {
    // Paper Button styles are handled by the component
  },
});

export default PaymentSummaryScreen;
