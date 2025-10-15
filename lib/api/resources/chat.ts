/**
 * Chat API Resource
 * Handles all chat-related API operations
 */

import { apiClient } from "../client"
import type { ApiResponse } from "../types"
import type {
  ToggleChatPinRequest,
  ToggleChatPinResponse,
  UpdateChatModelRequest,
  UpdateChatModelResponse,
} from "../types"

/**
 * Update the model for an existing chat
 */
export async function updateChatModel(
  chatId: string,
  model: string
): Promise<ApiResponse<UpdateChatModelResponse>> {
  return apiClient.post<UpdateChatModelResponse>("/api/update-chat-model", {
    chatId,
    model,
  })
}

/**
 * Toggle chat pin status
 */
export async function toggleChatPin(
  chatId: string,
  pinned: boolean
): Promise<ApiResponse<ToggleChatPinResponse>> {
  return apiClient.post<ToggleChatPinResponse>("/api/toggle-chat-pin", {
    chatId,
    pinned,
  })
}

/**
 * Create a new chat session
 */
export async function createChat(data: {
  title?: string
  model: string
  projectId?: string
}): Promise<ApiResponse<{ chatId: string }>> {
  return apiClient.post<{ chatId: string }>("/api/create-chat", data)
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.delete<{ success: boolean }>(`/api/chats/${chatId}`)
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<ApiResponse<{ success: boolean; title: string }>> {
  return apiClient.patch<{ success: boolean; title: string }>(`/api/chats/${chatId}`, {
    title,
  })
}
