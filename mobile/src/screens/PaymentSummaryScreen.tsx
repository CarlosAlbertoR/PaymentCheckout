import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  useTheme,
  Card,
  Button,
  Chip,
  Divider,
  Portal,
  ProgressBar,
} from "react-native-paper";
import { RootStackParamList, CustomerInfo, ProductItem } from "../types";
import { RootState, AppDispatch } from "../store";
import {
  setCreditCard,
  setProcessing,
  setError,
} from "../store/slices/paymentSlice";
import { processPayment } from "../store/slices/transactionSlice";
import { formatPriceCOP, formatTotalCOP } from "../utils/currency";

type PaymentSummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentSummary"
>;
type PaymentSummaryScreenRouteProp = RouteProp<
  RootStackParamList,
  "PaymentSummary"
>;

const PaymentSummaryScreen: React.FC = () => {
  const navigation = useNavigation<PaymentSummaryScreenNavigationProp>();
  const route = useRoute<PaymentSummaryScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );
  const { creditCard, isProcessing } = useSelector(
    (state: RootState) => state.payment
  );

  // Obtener información del cliente desde los parámetros de navegación
  const customerInfo: CustomerInfo = route.params?.customerInfo || {
    name: "Test Customer",
    email: "test@example.com",
  };

  const handleConfirmPayment = async () => {
    if (!creditCard) {
      Alert.alert(
        "Missing Information",
        "Please enter your payment details first"
      );
      return;
    }

    dispatch(setProcessing(true));
    dispatch(setError(null));

    try {
      // Transformar CartItem a ProductItem para el backend
      const products: ProductItem[] = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const ivaRate = 19; // default IVA
      const ivaAmount = (total * ivaRate) / 100;
      const totalWithIva = total + ivaAmount;

      const paymentData = {
        products,
        customerInfo,
        totalAmount: totalWithIva, // Send total with IVA to backend
        creditCard,
        currency: "COP",
        description: `Compra de ${cartItems.length} productos`,
        ivaRate,
      };

      console.log("🚀 Starting payment process...");
      console.log("📦 Payment data:", paymentData);

      const result = (await dispatch(
        processPayment(paymentData)
      ).unwrap()) as any;

      console.log("✅ Payment successful:", result);

      dispatch(setCreditCard(creditCard));
      navigation.navigate("TransactionResult", {
        transaction: result.transaction,
      });
    } catch (error: any) {
      console.error("❌ Payment error:", error);
      const errorMessage =
        error.message || error.payload || "Error al procesar el pago";
      dispatch(setError(errorMessage));
      Alert.alert("Payment Error", errorMessage);
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleEditPayment = () => {
    navigation.navigate("PaymentForm", { customerInfo });
  };

  const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return "**** **** **** ****";
    const cleaned = cardNumber.replace(/\s/g, "");
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.orderCard}>
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
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalAmount}>{formatTotalCOP(total)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (19%):</Text>
              <Text style={styles.totalAmount}>
                {formatTotalCOP((total * 19) / 100)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabelFinal}>Total:</Text>
              <Text style={styles.totalAmountFinal}>
                {formatTotalCOP(total + (total * 19) / 100)}
              </Text>
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
                  {creditCard?.exp_month && creditCard?.exp_year
                    ? `${creditCard.exp_month}/${creditCard.exp_year}`
                    : "Not specified"}
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

        <Card style={styles.customerCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Customer Information</Text>

            <View style={styles.customerInfo}>
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>Name:</Text>
                <Text style={styles.customerValue}>{customerInfo.name}</Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>Email:</Text>
                <Text style={styles.customerValue}>{customerInfo.email}</Text>
              </View>

              {customerInfo.phone && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.customerRow}>
                    <Text style={styles.customerLabel}>Phone:</Text>
                    <Text style={styles.customerValue}>
                      {customerInfo.phone}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.footerCard}>
          <Card.Content>
            <View style={styles.buttonContainer}>
              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ProgressBar indeterminate color={theme.colors.primary} />
                  <Text style={styles.processingText}>
                    Processing payment...
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                icon="credit-card"
                onPress={handleConfirmPayment}
                disabled={isProcessing}
                loading={isProcessing}
                style={styles.confirmButton}
              >
                Confirm and Process Payment
              </Button>

              <Button
                mode="outlined"
                icon="arrow-left"
                onPress={() => navigation.goBack()}
                disabled={isProcessing}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Backdrop Modal for Processing */}
      <Portal>
        <Modal
          visible={isProcessing}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.backdrop}>
            <Card style={styles.backdropCard}>
              <Card.Content style={styles.backdropContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.backdropTitle}>Processing Payment</Text>
                <Text style={styles.backdropSubtitle}>
                  Please wait while we process your payment securely...
                </Text>
                <ProgressBar indeterminate color={theme.colors.primary} />
              </Card.Content>
            </Card>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC", // Wompi background
  },
  scrollView: {
    flex: 1,
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
  customerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  customerLabel: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  customerValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdropCard: {
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    borderRadius: 16,
  },
  backdropContent: {
    alignItems: "center",
    padding: 32,
  },
  backdropTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  backdropSubtitle: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
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
  totalLabelFinal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  totalAmountFinal: {
    fontSize: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
    flex: 1,
    marginRight: 8,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    flex: 2,
    textAlign: "right",
  },
  cardChip: {
    backgroundColor: "#00D4AA", // Wompi primary
    marginLeft: 8,
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
