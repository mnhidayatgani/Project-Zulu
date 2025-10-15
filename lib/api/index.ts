/**
 * API Module - Centralized API Client
 * 
 * Provides type-safe HTTP methods with:
 * - Automatic CSRF token injection
 * - Error handling and retries
 * - Request/response interceptors
 * - Timeout support
 * - Type safety
 * 
 * @example
 * ```typescript
 * import { api } from '@/lib/api'
 * 
 * // Using resource methods
 * const result = await api.chat.updateModel(chatId, modelId)
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 * 
 * // Using client directly
 * const response = await api.client.get('/api/custom-endpoint')
 * ```
 */

// Export client
export { apiClient, ApiClient, fetchClient } from "./client"

// Export types
export type * from "./types"

// Export resources
import * as chat from "./resources/chat"
import * as user from "./resources/user"
import * as models from "./resources/models"
import * as projects from "./resources/projects"
import * as system from "./resources/system"

export const api = {
  chat,
  user,
  models,
  projects,
  system,
}

// Re-export individual resources for direct imports
export { chat, user, models, projects, system }
