import { getApiUrl } from "../config/api.config";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ApiService {
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
      console.log(`🌐 Making request to: ${url}`);
      const response = await fetch(url, defaultOptions);

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error [${endpoint}]:`, errorData);
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(`✅ API Success [${endpoint}]:`, result);
      return result;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
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

  async getCategories() {
    return this.request("/products/categories");
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

  // Alias por compatibilidad de tests
  async getTransactionStatus(id: string) {
    return this.getTransaction(id);
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
