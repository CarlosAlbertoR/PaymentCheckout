import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, Divider } from "react-native-paper";
import { RootStackParamList } from "../types";
import { RootState, AppDispatch } from "../store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import { formatPriceCOP, formatTotalCOP } from "../utils/currency";

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, "Cart">;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );

  // IVA calculation (19% default)
  const ivaRate = 19;
  const ivaAmount = (total * ivaRate) / 100;
  const totalWithIva = total + ivaAmount;

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      "Remove Product",
      "Are you sure you want to remove this product from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => dispatch(removeFromCart(productId)),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your entire cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => dispatch(clearCart()),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Add products to your cart before continuing");
      return;
    }
    navigation.navigate("Checkout");
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <Card style={styles.cartItem}>
      <Card.Content>
        <View style={styles.itemRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>

            <View style={styles.quantityControls}>
              <Button
                mode="outlined"
                onPress={() =>
                  handleUpdateQuantity(item.productId, item.quantity - 1)
                }
                style={styles.quantityButton}
                compact
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <Chip style={styles.quantityChip} icon="numeric">
                {item.quantity}
              </Chip>
              <Button
                mode="outlined"
                onPress={() =>
                  handleUpdateQuantity(item.productId, item.quantity + 1)
                }
                style={styles.quantityButton}
                compact
              >
                +
              </Button>
            </View>
          </View>

          <View style={styles.itemActions}>
            <View style={styles.itemTotalContainer}>
              <Text style={styles.itemTotal}>
                {formatPriceCOP(item.price * item.quantity)}
              </Text>
              <Text style={styles.itemTotalIva}>
                + IVA ({ivaRate}%):{" "}
                {formatPriceCOP((item.price * item.quantity * ivaRate) / 100)}
              </Text>
            </View>
            <Button
              mode="outlined"
              icon="delete"
              onPress={() => handleRemoveItem(item.productId)}
              style={styles.removeButton}
              compact
              buttonColor="#ffebee" // Light red background
              textColor="#d32f2f" // Red text
            >
              Remove
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Discover our products and start shopping
            </Text>
            <Button
              mode="contained"
              icon="shopping"
              onPress={() => navigation.navigate("Home")}
              style={styles.shopButton}
            >
              Start Shopping
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.headerSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </Text>
            </View>
            <Chip icon="cart" style={styles.headerChip}>
              {formatTotalCOP(total)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <Card style={styles.footer}>
        <Card.Content>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalAmount}>{formatTotalCOP(total)}</Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>IVA ({ivaRate}%):</Text>
            <Text style={styles.totalAmount}>{formatTotalCOP(ivaAmount)}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabelFinal}>Total:</Text>
            <Text style={styles.totalAmountFinal}>
              {formatTotalCOP(totalWithIva)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              icon="delete-sweep"
              onPress={handleClearCart}
              style={styles.clearButton}
              buttonColor="#ffebee" // Light red background
              textColor="#d32f2f" // Red text
            >
              Clear Cart
            </Button>

            <Button
              mode="contained"
              icon="credit-card"
              onPress={handleCheckout}
              style={styles.checkoutButton}
            >
              Checkout
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC", // Wompi background
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  headerChip: {
    backgroundColor: "#00D4AA", // Wompi primary
  },
  cartList: {
    padding: 16,
    paddingTop: 0,
  },
  cartItem: {
    marginBottom: 12,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#00D4AA", // Wompi primary
    fontWeight: "bold",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    // Paper Button styles are handled by the component
  },
  quantityChip: {
    backgroundColor: "#00D4AA", // Wompi primary
    marginHorizontal: 10,
  },
  itemActions: {
    alignItems: "flex-end",
  },
  itemTotalContainer: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
    marginBottom: 2,
  },
  itemTotalIva: {
    fontSize: 12,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  removeButton: {
    // Paper Button styles are handled by the component
  },
  footer: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  checkoutButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC", // Wompi background
    padding: 20,
  },
  emptyCard: {
    elevation: 2,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#4A5568", // Wompi onSurfaceVariant
    textAlign: "center",
    marginBottom: 24,
  },
  shopButton: {
    // Paper Button styles are handled by the component
  },
  divider: {
    marginVertical: 16,
  },
});

export default CartScreen;
