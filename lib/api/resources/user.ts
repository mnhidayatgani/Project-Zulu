/**
 * User API Resource
 * Handles all user-related API operations
 */

import { apiClient } from "../client"
import type { ApiResponse, CreateGuestResponse, RateLimitResponse } from "../types"

/**
 * Create a guest user
 */
export async function createGuestUser(
  guestId: string
): Promise<ApiResponse<CreateGuestResponse>> {
  return apiClient.post<CreateGuestResponse>("/api/create-guest", {
    userId: guestId,
  })
}

/**
 * Check user's rate limits
 */
export async function checkRateLimits(
  userId: string,
  isAuthenticated: boolean
): Promise<ApiResponse<RateLimitResponse>> {
  return apiClient.get<RateLimitResponse>("/api/rate-limits", {
    params: {
      userId,
      isAuthenticated,
    },
  })
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<ApiResponse<unknown>> {
  return apiClient.get("/api/user-preferences")
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  return apiClient.post("/api/user-preferences", preferences)
}

/**
 * Get user's favorite models
 */
export async function getFavoriteModels(): Promise<ApiResponse<string[]>> {
  return apiClient.get<string[]>("/api/user-preferences/favorite-models")
}

/**
 * Update user's favorite models
 */
export async function updateFavoriteModels(
  models: string[]
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>(
    "/api/user-preferences/favorite-models",
    { models }
  )
}

/**
 * Get user API keys status
 */
export async function getUserKeysStatus(): Promise<ApiResponse<Record<string, boolean>>> {
  return apiClient.get<Record<string, boolean>>("/api/user-key-status")
}

/**
 * Get user API keys
 */
export async function getUserKeys(): Promise<ApiResponse<unknown>> {
  return apiClient.get("/api/user-keys")
}

/**
 * Save user API key
 */
export async function saveUserKey(
  provider: string,
  key: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>("/api/user-keys", {
    provider,
    key,
  })
}

/**
 * Delete user API key
 */
export async function deleteUserKey(
  provider: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.delete<{ success: boolean }>(`/api/user-keys/${provider}`)
}
