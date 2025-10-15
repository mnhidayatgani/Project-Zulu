/**
 * Models API Resource
 * Handles all model-related API operations
 */

import { apiClient } from "../client"
import type { ApiResponse } from "../types"

export interface ModelInfo {
  id: string
  name: string
  provider: string
  providerId: string
  contextWindow?: number
  vision?: boolean
  tools?: boolean
}

export interface ModelsResponse {
  models: ModelInfo[]
}

export interface ProvidersResponse {
  providers: Array<{
    id: string
    name: string
    available: boolean
    models: string[]
  }>
}

/**
 * Get all available models
 */
export async function getModels(): Promise<ApiResponse<ModelsResponse>> {
  return apiClient.get<ModelsResponse>("/api/models")
}

/**
 * Get all providers
 */
export async function getProviders(): Promise<ApiResponse<ProvidersResponse>> {
  return apiClient.get<ProvidersResponse>("/api/providers")
}

/**
 * Get Ollama models (if Ollama is available)
 */
export async function getOllamaModels(
  baseURL: string
): Promise<ApiResponse<{ models: Array<{ name: string; model: string }> }>> {
  return apiClient.get(`${baseURL}/api/tags`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

/**
 * Check Ollama health
 */
export async function checkOllamaHealth(baseURL: string): Promise<ApiResponse<unknown>> {
  return apiClient.get(`${baseURL}/api/version`)
}
