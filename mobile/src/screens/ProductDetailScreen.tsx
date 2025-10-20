import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, Divider } from "react-native-paper";
import { RootStackParamList } from "../types";
import { AppDispatch } from "../store";
import { addToCart } from "../store/slices/cartSlice";
import { formatPriceCOP } from "../utils/currency";

type ProductDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;
type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    };
    console.log("🛒 Adding to cart:", cartItem);
    dispatch(addToCart(cartItem));
    Alert.alert(
      "Added to Cart",
      `Added ${quantity} item(s) to your shopping cart`
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigation.navigate("Cart");
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.imageCard}>
        <Card.Cover
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
        />
      </Card>

      <Card style={styles.contentCard}>
        <Card.Content>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {formatPriceCOP(product.price)}
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <Chip icon="package-variant" style={styles.stockChip}>
            {product.stock} available
          </Chip>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <Button
                mode="outlined"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
                compact
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Chip style={styles.quantityChip} icon="numeric">
                {quantity}
              </Chip>
              <Button
                mode="outlined"
                onPress={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                style={styles.quantityButton}
                compact
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </View>
            {quantity >= product.stock && (
              <Chip icon="alert" style={styles.warningChip}>
                Maximum stock reached
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.buttonCard}>
        <Card.Content>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              icon="cart-plus"
              onPress={handleAddToCart}
              style={styles.addToCartButton}
            >
              Add to Cart
            </Button>

            <Button
              mode="contained"
              icon="credit-card"
              onPress={handleBuyNow}
              style={styles.buyNowButton}
            >
              Buy Now
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
  imageCard: {
    margin: 16,
    elevation: 2,
  },
  productImage: {
    height: 300,
  },
  contentCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  divider: {
    marginVertical: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginTop: 20,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: "#4A5568", // Wompi onSurfaceVariant
    lineHeight: 24,
  },
  stockChip: {
    backgroundColor: "#00D4AA", // Wompi primary
    marginBottom: 15,
  },
  quantitySection: {
    marginTop: 20,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    // Paper Button styles are handled by the component
  },
  quantityChip: {
    backgroundColor: "#00D4AA", // Wompi primary
    marginHorizontal: 10,
  },
  warningChip: {
    backgroundColor: "#FF9800", // Warning color
    marginTop: 8,
  },
  buttonCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
  },
  buyNowButton: {
    flex: 1,
  },
});

export default ProductDetailScreen;
