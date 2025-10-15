/**
 * API Types & Interfaces
 * Centralized type definitions for API client
 */

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  success: boolean
}

export interface RequestConfig {
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: HeadersInit
  method?: string
  body?: BodyInit | null
  cache?: RequestCache
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  signal?: AbortSignal
  window?: null
}

export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: HeadersInit
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>
  onError?: (error: ApiError) => void | Promise<void>
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface FetchOptions extends Omit<RequestConfig, 'body'> {
  method?: HttpMethod
  body?: unknown
}

// CSRF Token
export interface CsrfToken {
  token: string
}

// Rate Limits
export interface RateLimitResponse {
  dailyCount: number
  dailyProCount: number
  dailyLimit: number
  remaining: number
  remainingPro: number
}

// User Types
export interface CreateGuestResponse {
  userId: string
  success: boolean
}

export interface UpdateChatModelRequest {
  chatId: string
  model: string
}

export interface UpdateChatModelResponse {
  success: boolean
  chatId: string
  model: string
}

// Chat Types
export interface ToggleChatPinRequest {
  chatId: string
  pinned: boolean
}

export interface ToggleChatPinResponse {
  success: boolean
  chatId: string
  pinned: boolean
}

// Projects
export interface Project {
  id: string
  name: string
  userId: string
  user_id: string  // Database column name (alias for compatibility)
  createdAt: string
  created_at: string  // Database column name (alias for compatibility)
}

export interface CreateProjectRequest {
  name: string
}

export interface UpdateProjectRequest {
  name: string
}
