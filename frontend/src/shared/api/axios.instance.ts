/**
 * Configured Axios instance with interceptors
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { logError } from "../lib/utils/errorHandler";
import { API_BASE_URL } from "./config";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for video uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }

    // Add timestamp to prevent caching
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error: AxiosError) => {
    logError(error, "Request Interceptor");
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.status,
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    // Log error
    logError(error, "API Response");

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (process.env.NODE_ENV === "development") {
        console.error(`[API Error] ${status}:`, data);
      }

      // Handle rate limiting
      if (status === 429) {
        console.warn(
          "Rate limit exceeded. Please wait before making more requests.",
        );
      }

      // Handle authentication errors (if needed in future)
      if (status === 401) {
        console.warn("Unauthorized. Please log in.");
        // TODO: Redirect to login page or refresh token
      }

      // Handle server errors
      if (status >= 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

// Helper function to create FormData requests
export const createFormDataRequest = (
  file: File,
  additionalData?: Record<string, any>,
) => {
  const formData = new FormData();
  formData.append("file", file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return formData;
};

// Helper function for multipart/form-data requests
export const uploadFile = async <T = any>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<T> => {
  const formData = createFormDataRequest(file, additionalData);

  const response = await apiClient.post<T>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};

export default apiClient;
