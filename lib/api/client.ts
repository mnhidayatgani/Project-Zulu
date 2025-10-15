/**
 * Centralized API Client
 * Provides type-safe HTTP methods with error handling, retries, and interceptors
 */

import type {
  ApiClientConfig,
  ApiError,
  ApiResponse,
  FetchOptions,
  HttpMethod,
  RequestConfig,
} from "./types"

class ApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: "",
      timeout: 30000,
      retries: 0,
      retryDelay: 1000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    }
  }

  /**
   * Get CSRF token from cookies
   */
  private getCsrfToken(): string {
    if (typeof document === "undefined") return ""

    const csrf = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrf_token="))
      ?.split("=")[1]

    return csrf || ""
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const baseURL = this.config.baseURL || ""
    const url = new URL(`${baseURL}${endpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  /**
   * Prepare request headers
   */
  private prepareHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      ...(this.config.headers as Record<string, string>),
      ...(customHeaders as Record<string, string>),
    }

    // Add CSRF token for state-changing requests
    const csrfToken = this.getCsrfToken()
    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken
    }

    return headers
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      return response.json()
    }

    if (contentType?.includes("text/")) {
      return response.text() as T
    }

    return response.blob() as T
  }

  /**
   * Create API error from response
   */
  private async createApiError(response: Response): Promise<ApiError> {
    let message = `Request failed with status ${response.status}`
    let details: unknown

    try {
      const data = await response.json()
      message = data.error || data.message || message
      details = data
    } catch {
      // If parsing fails, use default message
      message = response.statusText || message
    }

    return {
      message,
      status: response.status,
      code: response.status.toString(),
      details,
    }
  }

  /**
   * Make HTTP request with retries
   */
  private async makeRequest<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, timeout, retries, retryDelay, body, ...fetchOptions } = options

    const url = this.buildUrl(endpoint, params)
    const headers = this.prepareHeaders(options.headers)

    let config: RequestConfig = {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    // Call request interceptor
    if (this.config.onRequest) {
      config = await this.config.onRequest(config)
    }

    const maxRetries = retries ?? this.config.retries ?? 0
    const delay = retryDelay ?? this.config.retryDelay ?? 1000
    const requestTimeout = timeout ?? this.config.timeout ?? 30000

    let lastError: ApiError | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await this.createApiError(response)

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            if (this.config.onError) {
              await this.config.onError(error)
            }
            return { success: false, error }
          }

          // Retry server errors (5xx)
          if (attempt < maxRetries) {
            lastError = error
            await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
            continue
          }

          if (this.config.onError) {
            await this.config.onError(error)
          }
          return { success: false, error }
        }

        let data = await this.parseResponse<T>(response)

        // Call response interceptor
        if (this.config.onResponse) {
          data = await this.config.onResponse(response, data)
        }

        return { success: true, data }
      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          code: error instanceof Error && error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
          details: error,
        }

        // Retry on network errors
        if (attempt < maxRetries) {
          lastError = apiError
          await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
          continue
        }

        if (this.config.onError) {
          await this.config.onError(apiError)
        }
        return { success: false, error: apiError }
      }
    }

    // Should not reach here, but just in case
    return {
      success: false,
      error: lastError || { message: "Request failed after retries" },
    }
  }

  /**
   * Perform GET request
   */
  async get<T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET" })
  }

  /**
   * Perform POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "POST", body })
  }

  /**
   * Perform PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "PUT", body })
  }

  /**
   * Perform PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "PATCH", body })
  }

  /**
   * Perform DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: "DELETE" })
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config }
  }
}

// Create singleton instance
export const apiClient = new ApiClient({
  baseURL: "",
  timeout: 30000,
  retries: 1,
  retryDelay: 1000,
})

// Export class for custom instances
export { ApiClient }

// Export for backward compatibility with fetchClient
export const fetchClient = async (input: RequestInfo, init?: RequestInit) => {
  const csrf = typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((c) => c.startsWith("csrf_token="))
        ?.split("=")[1]
    : ""

  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "x-csrf-token": csrf || "",
      "Content-Type": "application/json",
    },
  })
}
