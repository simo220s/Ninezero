/**
 * API Client Utilities
 * 
 * Centralized API request handling with consistent patterns.
 * Provides reusable functions for making authenticated API calls.
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// Types
// ============================================================================

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get API base URL from environment
 */
export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || '';
}

/**
 * Get authentication headers
 * 
 * Retrieves the access token from localStorage and formats it
 * as an Authorization header.
 * 
 * @returns Headers object with Authorization and Content-Type
 * 
 * @example
 * ```typescript
 * const headers = getAuthHeaders();
 * // Returns: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' }
 * ```
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get standard headers without authentication
 * 
 * @returns Headers object with Content-Type
 */
export function getStandardHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

// ============================================================================
// API Request Functions
// ============================================================================

/**
 * Make an authenticated API request
 * 
 * Centralized function for making API calls with consistent error handling
 * and authentication.
 * 
 * @param endpoint - API endpoint path (e.g., '/api/notifications')
 * @param options - Request options
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * // GET request
 * const response = await apiRequest<Notification[]>('/api/notifications');
 * 
 * // POST request
 * const response = await apiRequest<User>('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * });
 * 
 * // Handle response
 * if (response.success) {
 *   console.log(response.data);
 * } else {
 *   console.error(response.error);
 * }
 * ```
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers: customHeaders,
    requiresAuth = true,
  } = options;

  try {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;

    // Prepare headers
    const headers = requiresAuth 
      ? { ...getAuthHeaders(), ...customHeaders }
      : { ...getStandardHeaders(), ...customHeaders };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Make request
    const response = await fetch(url, requestOptions);

    // Parse response
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } else {
      // Handle error response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      logger.error(`API request failed: ${method} ${endpoint}`, {
        status: response.status,
        error: errorData,
      });

      return {
        success: false,
        error: errorData,
        message: errorData.message || 'Request failed',
      };
    }
  } catch (error) {
    logger.error(`API request error: ${method} ${endpoint}`, error);
    return {
      success: false,
      error,
      message: 'Network error or request failed',
    };
  }
}

/**
 * Make a GET request
 * 
 * @param endpoint - API endpoint path
 * @param requiresAuth - Whether authentication is required (default: true)
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * const response = await apiGet<Notification[]>('/api/notifications');
 * ```
 */
export async function apiGet<T = any>(
  endpoint: string,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET', requiresAuth });
}

/**
 * Make a POST request
 * 
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param requiresAuth - Whether authentication is required (default: true)
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * const response = await apiPost<User>('/api/users', {
 *   name: 'John',
 *   email: 'john@example.com'
 * });
 * ```
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth });
}

/**
 * Make a PUT request
 * 
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param requiresAuth - Whether authentication is required (default: true)
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * const response = await apiPut<User>('/api/users/123', {
 *   name: 'John Updated'
 * });
 * ```
 */
export async function apiPut<T = any>(
  endpoint: string,
  body: any,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth });
}

/**
 * Make a DELETE request
 * 
 * @param endpoint - API endpoint path
 * @param requiresAuth - Whether authentication is required (default: true)
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * const response = await apiDelete('/api/users/123');
 * ```
 */
export async function apiDelete<T = any>(
  endpoint: string,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE', requiresAuth });
}

/**
 * Make a PATCH request
 * 
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param requiresAuth - Whether authentication is required (default: true)
 * @returns Promise with typed response
 * 
 * @example
 * ```typescript
 * const response = await apiPatch<User>('/api/users/123', {
 *   email: 'newemail@example.com'
 * });
 * ```
 */
export async function apiPatch<T = any>(
  endpoint: string,
  body: any,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth });
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getApiUrl,
  getAuthHeaders,
  getStandardHeaders,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
};
