/**
 * Projects API Resource
 * Handles all project-related API operations
 */

import { apiClient } from "../client"
import type { ApiResponse, CreateProjectRequest, Project, UpdateProjectRequest } from "../types"

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<ApiResponse<Project[]>> {
  return apiClient.get<Project[]>("/api/projects")
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<ApiResponse<Project>> {
  return apiClient.get<Project>(`/api/projects/${projectId}`)
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectRequest
): Promise<ApiResponse<Project>> {
  return apiClient.post<Project>("/api/projects", data)
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<ApiResponse<Project>> {
  return apiClient.put<Project>(`/api/projects/${projectId}`, data)
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.delete<{ success: boolean }>(`/api/projects/${projectId}`)
}

/**
 * Move chat to project
 */
export async function moveChatToProject(
  chatId: string,
  projectId: string | null
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.patch<{ success: boolean }>(`/api/chats/${chatId}/project`, {
    projectId,
  })
}
