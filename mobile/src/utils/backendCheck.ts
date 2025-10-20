import { apiService } from "../services/api.service";

export const checkBackendConnection = async (): Promise<{
  isConnected: boolean;
  error?: string;
}> => {
  try {
    console.log("🔍 Checking backend connection...");
    const health = await apiService.healthCheck();
    console.log("✅ Backend is connected:", health);
    return { isConnected: true };
  } catch (error: any) {
    console.error("❌ Backend connection failed:", error);
    return {
      isConnected: false,
      error: error.message || "Backend server is not available",
    };
  }
};

export const getBackendUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
};
