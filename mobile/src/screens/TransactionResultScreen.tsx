import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, Divider } from "react-native-paper";
import { RootStackParamList, Transaction } from "../types";
import { RootState, AppDispatch } from "../store";
import { clearCart } from "../store/slices/cartSlice";
import { formatPriceCOP, formatTotalCOP } from "../utils/currency";
import { resetTransaction } from "../store/slices/transactionSlice";

type TransactionResultScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TransactionResult"
>;
type TransactionResultScreenRouteProp = RouteProp<
  RootStackParamList,
  "TransactionResult"
>;

const TransactionResultScreen: React.FC = () => {
  const navigation = useNavigation<TransactionResultScreenNavigationProp>();
  const route = useRoute<TransactionResultScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { transaction } = route.params;

  const isSuccess = transaction.status === "COMPLETED";
  const isPending = transaction.status === "PENDING";
  const isFailed = transaction.status === "FAILED";

  useEffect(() => {
    // Clear cart if transaction was successful
    if (isSuccess) {
      dispatch(clearCart());
    }
  }, [isSuccess, dispatch]);

  const handleGoHome = () => {
    dispatch(resetTransaction());
    navigation.navigate("Home");
  };

  const handleTryAgain = () => {
    navigation.navigate("PaymentForm", {
      customerInfo: transaction.customerInfo,
    });
  };

  const getStatusIcon = () => {
    if (isSuccess) return "✅";
    if (isPending) return "⏳";
    if (isFailed) return "❌";
    return "❓";
  };

  const getStatusTitle = () => {
    if (isSuccess) return "Payment Successful!";
    if (isPending) return "Payment Processing";
    if (isFailed) return "Payment Failed";
    return "Unknown Status";
  };

  const getStatusMessage = () => {
    if (isSuccess)
      return "Your payment has been processed successfully. You will receive a confirmation email.";
    if (isPending)
      return "Your payment is being processed. We will notify you when it's ready.";
    if (isFailed)
      return "There was a problem with your payment. Please try again.";
    return "Could not determine the transaction status.";
  };

  const getStatusColor = () => {
    if (isSuccess) return "#4CAF50";
    if (isPending) return "#FF9800";
    if (isFailed) return "#f44336";
    return "#666";
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {getStatusTitle()}
          </Text>
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          <Chip
            icon={
              isSuccess ? "check-circle" : isFailed ? "close-circle" : "clock"
            }
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
          >
            {transaction.status}
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Number:</Text>
            <Text style={styles.detailValue}>
              {transaction.transactionNumber}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            >
              {transaction.status}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>
              {formatTotalCOP(transaction.totalAmount)}
            </Text>
          </View>

          {typeof transaction.ivaRate !== "undefined" && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                IVA ({transaction.ivaRate}%):
              </Text>
              <Text style={styles.detailValue}>
                {formatPriceCOP(transaction.ivaAmount || 0)}
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.productsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Purchased Items</Text>

          {transaction.products.map((item) => (
            <View key={item.productId} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDetails}>
                  Quantity: {item.quantity} x {formatPriceCOP(item.price)}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                {formatPriceCOP(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.customerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>
              {transaction.customerInfo.name}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>
              {transaction.customerInfo.email}
            </Text>
          </View>

          {transaction.customerInfo.phone && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>
                  {transaction.customerInfo.phone}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <View style={styles.actionsContainer}>
            {isFailed && (
              <Button
                mode="outlined"
                icon="refresh"
                onPress={handleTryAgain}
                style={styles.tryAgainButton}
                buttonColor="#ffebee"
                textColor="#d32f2f"
              >
                Try Again
              </Button>
            )}

            <Button
              mode="contained"
              icon={isSuccess ? "shopping" : "home"}
              onPress={handleGoHome}
              style={styles.homeButton}
            >
              {isSuccess ? "Continue Shopping" : "Back to Home"}
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
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusContent: {
    alignItems: "center",
    padding: 24,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  statusMessage: {
    fontSize: 16,
    color: "#4A5568", // Wompi onSurfaceVariant
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  statusChip: {
    marginTop: 8,
  },
  detailsCard: {
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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    textAlign: "right",
  },
  productsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  productDetails: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  productTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  customerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionsContainer: {
    gap: 12,
  },
  tryAgainButton: {
    // Paper Button styles are handled by the component
  },
  homeButton: {
    // Paper Button styles are handled by the component
  },
});

export default TransactionResultScreen;
