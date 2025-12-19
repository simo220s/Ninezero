/**
 * API Client for Laravel Backend Integration
 * Handles authentication, token refresh, and request/response management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

// Token management
export const TokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setTokens(accessToken: string, refreshToken: string, expiresAt?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt)
    }
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  },

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiry) return false
    return new Date() >= new Date(expiry)
  },
}

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

const processQueue = (token: string | null): void => {
  refreshQueue.forEach((callback) => {
    if (token) callback(token)
  })
  refreshQueue = []
}

/**
 * Refresh the access token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = TokenManager.getRefreshToken()
  
  if (!refreshToken) {
    TokenManager.clearTokens()
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    TokenManager.setTokens(data.accessToken, data.refreshToken, data.expires_at)
    return data.accessToken
  } catch (error) {
    TokenManager.clearTokens()
    // Redirect to login
    window.location.href = '/login'
    return null
  }
}

/**
 * API Client with automatic token refresh
 */
export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Make an authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const accessToken = TokenManager.getAccessToken()

    // Add authorization header if token exists
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      let response = await fetch(url, config)

      // Handle 401 - Token expired or invalid
      if (response.status === 401 && accessToken) {
        if (!isRefreshing) {
          isRefreshing = true

          const newToken = await refreshAccessToken()
          isRefreshing = false

          if (newToken) {
            processQueue(newToken)
            
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newToken}`
            response = await fetch(url, { ...config, headers })
          } else {
            processQueue(null)
            throw new Error('Authentication failed')
          }
        } else {
          // Wait for refresh to complete
          const token = await new Promise<string>((resolve) => {
            refreshQueue.push(resolve)
          })
          headers['Authorization'] = `Bearer ${token}`
          response = await fetch(url, { ...config, headers })
        }
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return {} as T
      }

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status, data)
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : ''
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export API base URL for reference
export { API_BASE_URL }

