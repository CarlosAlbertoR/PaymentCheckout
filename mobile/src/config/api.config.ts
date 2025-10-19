export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  endpoints: {
    products: "/products",
    transactions: "/transactions",
    health: "/health",
  },
  timeout: 10000, // 10 seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
