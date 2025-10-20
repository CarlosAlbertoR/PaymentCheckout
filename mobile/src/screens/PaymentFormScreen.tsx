import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useTheme,
  Card,
  Button,
  TextInput,
  Chip,
  Divider,
  ProgressBar,
  HelperText,
} from "react-native-paper";
import { RootStackParamList, CustomerInfo, CreditCardInfo } from "../types";
import { RootState, AppDispatch } from "../store";
import {
  setCreditCard,
  setProcessing,
  setError,
} from "../store/slices/paymentSlice";
import { formatPriceCOP, formatTotalCOP } from "../utils/currency";
import { processPayment } from "../store/slices/transactionSlice";
import {
  creditCardSchema,
  CreditCardFormData,
} from "../schemas/payment.schema";

type PaymentFormScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentForm"
>;
type PaymentFormScreenRouteProp = RouteProp<RootStackParamList, "PaymentForm">;

const PaymentFormScreen: React.FC = () => {
  const navigation = useNavigation<PaymentFormScreenNavigationProp>();
  const route = useRoute<PaymentFormScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );
  const { isProcessing } = useSelector((state: RootState) => state.payment);

  // Obtener información del cliente desde los parámetros de navegación
  const customerInfo: CustomerInfo = route.params?.customerInfo || {
    name: "Test Customer",
    email: "test@example.com",
  };

  // Configurar react-hook-form con zod
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    mode: "onChange",
    defaultValues: {
      number: "",
      expiry: "",
      cvc: "",
      cardholderName: "",
    },
  });

  const cardNumber = watch("number") || "";

  const detectCardBrand = (cardNumberInput: string | undefined): string => {
    const number = (cardNumberInput || "").replace(/\s/g, "");
    if (number.startsWith("4")) return "VISA";
    if (number.startsWith("5") || number.startsWith("2")) return "MASTERCARD";
    if (number.startsWith("3")) return "AMEX";
    return "UNKNOWN";
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted.substring(0, 19); // Máximo 16 dígitos + 3 espacios
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const onSubmit = (data: CreditCardFormData) => {
    // Los datos ya están validados por zod
    console.log("✅ Form data validated:", data);

    // Separar la fecha de expiración
    const expiry = data.expiry.replace("/", ""); // "12/25" -> "1225"
    const exp_month = expiry.substring(0, 2); // "12"
    const exp_year = expiry.substring(2, 4); // "25" (YY, no YYYY)

    // Crear objeto con fecha separada (sin campo expiry)
    const creditCardData: CreditCardInfo = {
      number: data.number,
      cvc: data.cvc,
      cardholderName: data.cardholderName,
      exp_month,
      exp_year,
    };

    // Guardar información de la tarjeta en el store
    dispatch(setCreditCard(creditCardData));

    // Navegar a PaymentSummaryScreen
    navigation.navigate("PaymentSummary", { customerInfo });
  };

  const cardBrand = detectCardBrand(cardNumber);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Card Number *"
                value={formatCardNumber(value)}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\s/g, "");
                  if (cleaned.length <= 16) {
                    onChange(cleaned);
                  }
                }}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
                mode="outlined"
                style={styles.input}
                error={!!errors.number}
                right={
                  cardBrand !== "UNKNOWN" && (
                    <TextInput.Icon icon="credit-card" />
                  )
                }
              />
            )}
          />
          <HelperText type="error" visible={!!errors.number}>
            {errors.number?.message}
          </HelperText>

          {cardBrand !== "UNKNOWN" && (
            <Chip icon="credit-card" style={styles.cardBrandChip}>
              {cardBrand}
            </Chip>
          )}

          <View style={styles.row}>
            <Controller
              control={control}
              name="expiry"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Expiry Date *"
                  value={formatExpiry(value)}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length <= 4) {
                      onChange(cleaned);
                    }
                  }}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  mode="outlined"
                  style={[styles.input, styles.halfWidth]}
                  error={!!errors.expiry}
                />
              )}
            />

            <Controller
              control={control}
              name="cvc"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="CVC *"
                  value={value}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length <= 4) {
                      onChange(cleaned);
                    }
                  }}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  mode="outlined"
                  style={[styles.input, styles.halfWidth]}
                  error={!!errors.cvc}
                />
              )}
            />
          </View>
          <HelperText type="error" visible={!!errors.expiry}>
            {errors.expiry?.message}
          </HelperText>
          <HelperText type="error" visible={!!errors.cvc}>
            {errors.cvc?.message}
          </HelperText>

          <Controller
            control={control}
            name="cardholderName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Cardholder Name *"
                value={value}
                onChangeText={onChange}
                placeholder="As it appears on the card"
                autoCapitalize="words"
                mode="outlined"
                style={styles.input}
                error={!!errors.cardholderName}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.cardholderName}>
            {errors.cardholderName?.message}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cartItems.map((item) => (
            <View key={item.productId} style={styles.paymentItem}>
              <Text style={styles.paymentItemName}>{item.name}</Text>
              <Text style={styles.paymentItemTotal}>
                {formatPriceCOP(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.paymentTotal}>
            <Text style={styles.paymentTotalLabel}>Total Amount:</Text>
            <Text style={styles.paymentTotalAmount}>
              {formatTotalCOP(total)}
            </Text>
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
            icon="arrow-right"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            style={styles.payButton}
            labelStyle={styles.payButtonText}
          >
            Continue to Summary
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
