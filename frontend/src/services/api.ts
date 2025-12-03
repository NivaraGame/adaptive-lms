import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiError } from '../types/api';

/**
 * API Client Configuration
 *
 * This module provides a configured axios instance for making HTTP requests
 * to the backend API. It includes request/response interceptors for:
 * - Request logging
 * - Authentication header injection
 * - Response data extraction
 * - Centralized error handling
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Create and configure the axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies for authentication
});

/**
 * Request Interceptor
 *
 * Runs before each request is sent to the server.
 * Used for:
 * - Logging requests (development only)
 * - Adding authentication headers (JWT token)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    // Add authentication token if available
    // TODO: Implement JWT token retrieval from storage (localStorage/sessionStorage)
    // const token = localStorage.getItem('auth_token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => {
    // Log request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 *
 * Runs after receiving a response from the server.
 * Used for:
 * - Extracting data from successful responses
 * - Logging responses (development only)
 * - Handling errors consistently
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response details in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Extract and return the data portion of the response
    // This allows consumers to use `await api.get(...)` directly without `.data`
    return response.data;
  },
  (error: AxiosError) => {
    // Handle error responses
    return handleApiError(error);
  }
);

/**
 * Centralized Error Handler
 *
 * Processes and formats errors from API calls into a consistent structure.
 * Handles:
 * - Network errors (no response from server)
 * - HTTP errors (4xx, 5xx status codes)
 * - Timeout errors
 */
function handleApiError(error: AxiosError): Promise<never> {
  let apiError: ApiError;

  if (error.response) {
    // Server responded with error status (4xx, 5xx)
    const status = error.response.status;
    const data = error.response.data as any;

    apiError = {
      message: data?.detail || data?.message || error.message || 'An error occurred',
      status,
      code: data?.code || `HTTP_${status}`,
      details: data?.errors || data?.detail || undefined,
    };

    // Log specific error types
    if (status >= 500) {
      console.error('[API Error] Server Error:', apiError);
    } else if (status >= 400) {
      console.warn('[API Error] Client Error:', apiError);
    }
  } else if (error.request) {
    // Request was made but no response received (network error)
    apiError = {
      message: 'Network error: Unable to reach the server',
      status: 0,
      code: 'NETWORK_ERROR',
      details: error.message,
    };
    console.error('[API Error] Network Error:', apiError);
  } else {
    // Error in request configuration
    apiError = {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      code: 'REQUEST_ERROR',
      details: error.message,
    };
    console.error('[API Error] Request Configuration Error:', apiError);
  }

  // Handle timeout specifically
  if (error.code === 'ECONNABORTED') {
    apiError = {
      message: 'Request timeout: The server took too long to respond',
      status: 0,
      code: 'TIMEOUT_ERROR',
      details: error.message,
    };
    console.error('[API Error] Timeout Error:', apiError);
  }

  // Return rejected promise with formatted error
  return Promise.reject(apiError);
}

/**
 * Export the configured axios instance as default
 *
 * Usage examples:
 *
 * ```typescript
 * import api from './services/api';
 *
 * // GET request
 * const users = await api.get('/api/v1/users');
 *
 * // POST request
 * const newUser = await api.post('/api/v1/users', { username: 'john', email: 'john@example.com' });
 *
 * // With error handling
 * try {
 *   const content = await api.get('/api/v1/content');
 * } catch (error) {
 *   console.error('Failed to fetch content:', error.message);
 * }
 * ```
 */
export default apiClient;
