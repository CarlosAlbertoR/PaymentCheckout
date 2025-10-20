import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Button, Chip, FAB } from "react-native-paper";
import { RootStackParamList, Product } from "../types";
import { RootState, AppDispatch } from "../store";
import {
  fetchProducts,
  fetchCategories,
  setSelectedCategory,
} from "../store/slices/productsSlice";
import { addQuantityToCart } from "../store/slices/cartSlice";
import { formatPriceCOP } from "../utils/currency";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const {
    items: products,
    categories,
    selectedCategory,
    loading,
    error,
  } = useSelector((state: RootState) => state.products);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(selectedCategory));
  }, [dispatch, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    };
    dispatch(addQuantityToCart(cartItem));
    Alert.alert("Added to Cart", "Item has been added to your shopping cart");
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category));

    // Auto-scroll to selected category for better UX
    const categoryIndex = categoryOptions.findIndex(
      (opt) => opt.value === category
    );
    if (scrollViewRef.current && categoryIndex >= 0) {
      scrollViewRef.current.scrollTo({
        x: categoryIndex * 80, // Approximate chip width + margin
        animated: true,
      });
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Card.Content>
        <Text style={[styles.productName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.productDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
            {formatPriceCOP(item.price)}
          </Text>
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
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Loading catalog...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Error: {error}
        </Text>
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

  // Crear opciones para SegmentedButtons
  const categoryOptions = [
    { value: "all", label: "All" },
    ...categories.map((category) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
    })),
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              Shop
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Discover amazing products
            </Text>
          </View>
          <Chip
            icon="cart"
            onPress={() => navigation.navigate("Cart")}
            style={[styles.cartChip, { backgroundColor: theme.colors.primary }]}
            textStyle={{ color: theme.colors.onPrimary }}
          >
            Cart ({cartItems.length})
          </Chip>
        </Card.Content>
      </Card>

      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {categoryOptions.map((option) => (
              <Chip
                key={option.value}
                selected={selectedCategory === option.value}
                onPress={() => handleCategoryChange(option.value)}
                style={[
                  styles.categoryChip,
                  selectedCategory === option.value && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                textStyle={{
                  color:
                    selectedCategory === option.value
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                  fontSize: 12,
                }}
                compact
              >
                {option.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="cart"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Cart")}
        label={`${cartItems.length}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  cartChip: {
    // Theme colors applied dynamically
  },
  filterContainer: {
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  chipsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryChip: {
    height: 32,
    marginRight: 2,
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
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    // Paper Button styles are handled by the component
  },
});

export default HomeScreen;
