/**
 * System API Resource
 * Handles system-related API operations (health, CSRF, etc.)
 */

import { apiClient } from "../client"
import type { ApiResponse, CsrfToken } from "../types"

/**
 * Get CSRF token
 */
export async function getCsrfToken(): Promise<ApiResponse<CsrfToken>> {
  return apiClient.get<CsrfToken>("/api/csrf")
}

/**
 * Health check
 */
export async function checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
  return apiClient.get<{ status: string; timestamp: string }>("/api/health")
}
