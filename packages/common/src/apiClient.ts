import axios, { AxiosInstance, AxiosError } from "axios";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true, // Include cookies for session authentication
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Only redirect if we're in a browser environment
      if (typeof window !== "undefined") {
        // Don't redirect if we're already on login/register pages
        const path = window.location.pathname;
        if (!["/login", "/register"].includes(path)) {
          window.location.href = "/login";
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Permission denied:", error.response.data);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    return {
      error: error.response.data.error || "An error occurred",
      errors: error.response.data.errors || [],
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      error: "No response from server. Please check your connection.",
      errors: [],
      status: 0,
    };
  } else {
    // Something else happened
    return {
      error: error.message || "An unexpected error occurred",
      errors: [],
      status: 0,
    };
  }
};
