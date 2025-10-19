import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, FAB } from "react-native-paper";
import { RootStackParamList, Product } from "../types";
import { RootState, AppDispatch } from "../store";
import { fetchProducts } from "../store/slices/productsSlice";
import { addToCart } from "../store/slices/cartSlice";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const {
    items: products,
    loading,
    error,
  } = useSelector((state: RootState) => state.products);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    };
    dispatch(addToCart(cartItem));
    Alert.alert("Added to Cart", "Item has been added to your shopping cart");
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Card.Content>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Button
            mode="contained"
            onPress={() => handleAddToCart(item)}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
            compact
          >
            Add
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading catalog...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button
          mode="contained"
          onPress={() => dispatch(fetchProducts())}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <Chip
          icon="cart"
          onPress={() => navigation.navigate("Cart")}
          style={styles.cartChip}
        >
          Cart ({cartItems.length})
        </Chip>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="cart"
        style={styles.fab}
        onPress={() => navigation.navigate("Cart")}
        label={`${cartItems.length}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC", // Wompi background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff", // Wompi surface
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0", // Wompi surfaceVariant
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
  },
  cartChip: {
    backgroundColor: "#00D4AA", // Wompi primary
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    marginBottom: 16,
    elevation: 2,
  },
  productImage: {
    height: 200,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: "#4A5568", // Wompi onSurfaceVariant
    marginBottom: 12,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA", // Wompi primary
  },
  addButton: {
    // Paper Button styles are handled by the component
  },
  addButtonText: {
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#00D4AA", // Wompi primary
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC", // Wompi background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A5568", // Wompi onSurfaceVariant
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F7FAFC", // Wompi background
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E", // Wompi error
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    // Paper Button styles are handled by the component
  },
});

export default HomeScreen;
