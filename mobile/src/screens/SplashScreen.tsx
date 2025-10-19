import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, Card, Chip } from "react-native-paper";
import { RootStackParamList } from "../types";

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Card style={styles.splashCard}>
        <Card.Content style={styles.splashContent}>
          <Text style={styles.title}>Payment Checkout</Text>
          <Text style={styles.subtitle}>Your trusted store</Text>

          <Chip icon="shield-check" style={styles.securityChip}>
            Secure Payment Gateway
          </Chip>

          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />

          <Text style={styles.loadingText}>Loading...</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D4AA", // Verde menta Wompi
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  splashCard: {
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    borderRadius: 16,
  },
  splashContent: {
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A202C", // Wompi onSurface
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#4A5568", // Wompi onSurfaceVariant
    marginBottom: 24,
    textAlign: "center",
  },
  securityChip: {
    backgroundColor: "#E6FFFA", // Wompi primary container
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#4A5568", // Wompi onSurfaceVariant
    textAlign: "center",
  },
});

export default SplashScreen;
