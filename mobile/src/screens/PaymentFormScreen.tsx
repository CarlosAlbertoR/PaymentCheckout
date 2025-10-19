import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  useTheme,
  Card,
  Button,
  TextInput,
  Chip,
  Divider,
  ProgressBar,
} from "react-native-paper";
import { RootStackParamList, CreditCardInfo } from "../types";
import { RootState, AppDispatch } from "../store";
import {
  setCreditCard,
  setProcessing,
  setError,
} from "../store/slices/paymentSlice";
import { processPayment } from "../store/slices/transactionSlice";

type PaymentFormScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentForm"
>;

const PaymentFormScreen: React.FC = () => {
  const navigation = useNavigation<PaymentFormScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );
  const { isProcessing } = useSelector((state: RootState) => state.payment);

  const [creditCard, setCreditCard] = useState<CreditCardInfo>({
    number: "",
    expiry: "",
    cvc: "",
    cardholderName: "",
  });

  const [customerInfo] = useState({
    name: "Juan Pérez", // En una app real vendría del estado global
    email: "juan@example.com",
    phone: "+1234567890",
  });

  const handleInputChange = (field: keyof CreditCardInfo, value: string) => {
    let formattedValue = value;

    // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19) return; // Máximo 16 dígitos + 3 espacios
    }

    // Formatear fecha de expiración (MM/YY)
    if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.substring(0, 2) + "/" + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Formatear CVC (máximo 4 dígitos)
    if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setCreditCard((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, "");
    if (number.startsWith("4")) return "VISA";
    if (number.startsWith("5") || number.startsWith("2")) return "MASTERCARD";
    if (number.startsWith("3")) return "AMEX";
    return "UNKNOWN";
  };

  const validateCard = (): boolean => {
    const number = creditCard.number.replace(/\s/g, "");
    const expiry = creditCard.expiry;
    const cvc = creditCard.cvc;

    if (number.length !== 16) {
      Alert.alert("Invalid Card", "Please enter a valid 16-digit card number");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert("Invalid Date", "Please enter expiry date in MM/YY format");
      return false;
    }

    if (cvc.length < 3) {
      Alert.alert("Invalid CVC", "Please enter a valid 3-digit CVC code");
      return false;
    }

    if (!creditCard.cardholderName.trim()) {
      Alert.alert("Required Field", "Please enter the cardholder name");
      return false;
    }

    return true;
  };

  const handleProcessPayment = async () => {
    if (!validateCard()) return;

    dispatch(setProcessing(true));
    dispatch(setError(null));

    try {
      const paymentData = {
        products: cartItems,
        customerInfo,
        totalAmount: total,
        creditCard,
        currency: "USD",
        description: `Compra de ${cartItems.length} productos`,
      };

      const result = await dispatch(
        processPayment(paymentData) as any
      ).unwrap();

      dispatch(setCreditCard(creditCard) as any);
      navigation.navigate("TransactionResult", {
        transaction: result.transaction,
      });
    } catch (error: any) {
      dispatch(setError(error.message || "Error al procesar el pago"));
      Alert.alert("Error", error.message || "Error al procesar el pago");
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const cardBrand = detectCardBrand(creditCard.number);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <TextInput
            label="Card Number *"
            value={creditCard.number}
            onChangeText={(value) => handleInputChange("number", value)}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
            mode="outlined"
            style={styles.input}
            right={
              cardBrand !== "UNKNOWN" && <TextInput.Icon icon="credit-card" />
            }
          />

          {cardBrand !== "UNKNOWN" && (
            <Chip icon="credit-card" style={styles.cardBrandChip}>
              {cardBrand}
            </Chip>
          )}

          <View style={styles.row}>
            <TextInput
              label="Expiry Date *"
              value={creditCard.expiry}
              onChangeText={(value) => handleInputChange("expiry", value)}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              mode="outlined"
              style={[styles.input, styles.halfWidth]}
            />

            <TextInput
              label="CVC *"
              value={creditCard.cvc}
              onChangeText={(value) => handleInputChange("cvc", value)}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              mode="outlined"
              style={[styles.input, styles.halfWidth]}
            />
          </View>

          <TextInput
            label="Cardholder Name *"
            value={creditCard.cardholderName}
            onChangeText={(value) => handleInputChange("cardholderName", value)}
            placeholder="As it appears on the card"
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cartItems.map((item) => (
            <View key={item.productId} style={styles.paymentItem}>
              <Text style={styles.paymentItemName}>{item.name}</Text>
              <Text style={styles.paymentItemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.paymentTotal}>
            <Text style={styles.paymentTotalLabel}>Total Amount:</Text>
            <Text style={styles.paymentTotalAmount}>${total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.footer}>
        <Card.Content>
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ProgressBar indeterminate color={theme.colors.primary} />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          )}

          <Button
            mode="contained"
            icon="credit-card"
            onPress={handleProcessPayment}
            disabled={isProcessing}
            loading={isProcessing}
            style={styles.payButton}
            labelStyle={styles.payButtonText}
          >
            Complete Purchase
          </Button>

          <Chip icon="shield-check" style={styles.securityChip}>
            Your information is protected with SSL encryption
          </Chip>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  cardInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cardInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  cardBrand: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: "#2196F3",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0", // Wompi surfaceVariant
  },
  paymentItemName: {
    fontSize: 16,
    color: "#1A202C", // Wompi onSurface
    flex: 1,
  },
  paymentItemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  paymentTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#00D4AA", // Wompi primary
  },
  paymentTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  paymentTotalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  footer: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  payButton: {
    marginTop: 16,
  },
  payButtonText: {
    fontSize: 18,
  },
  processingContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  processingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  securityChip: {
    marginTop: 16,
    backgroundColor: "#E6FFFA", // Wompi primary container
  },
  cardBrandChip: {
    backgroundColor: "#00D4AA", // Wompi primary
    marginBottom: 16,
    alignSelf: "flex-start",
  },
});

export default PaymentFormScreen;
