import { getApiUrl } from "../config/api.config";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl("");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = getApiUrl(endpoint);

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    return this.request("/products");
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async seedProducts() {
    return this.request("/products/seed", { method: "POST" });
  }

  // Transactions API
  async createTransaction(data: any) {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`);
  }

  async processPayment(data: any) {
    return this.request("/transactions/complete-payment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

export const apiService = new ApiService();
