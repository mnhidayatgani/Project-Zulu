/**
 * Custom hook for managing history item interactions
 * Shared logic for edit, delete, and search operations
 */

import { useCallback, useMemo, useState } from "react"
import type { Chats } from "@/lib/chat-store/types"

export type UseHistoryActionsProps = {
  chatHistory: Chats[]
  onSaveEdit: (id: string, newTitle: string) => Promise<void>
  onConfirmDelete: (id: string) => Promise<void>
}

export function useHistoryActions({
  chatHistory,
  onSaveEdit,
  onConfirmDelete,
}: UseHistoryActionsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Reset all states
  const resetStates = useCallback(() => {
    setSearchQuery("")
    setEditingId(null)
    setEditTitle("")
    setDeletingId(null)
  }, [])

  // Edit handlers
  const handleEdit = useCallback((chat: Chats) => {
    setEditingId(chat.id)
    setEditTitle(chat.title || "")
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string) => {
      setEditingId(null)
      await onSaveEdit(id, editTitle)
    },
    [editTitle, onSaveEdit]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTitle("")
  }, [])

  // Delete handlers
  const handleDelete = useCallback((id: string) => {
    setDeletingId(id)
  }, [])

  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setDeletingId(null)
      await onConfirmDelete(id)
    },
    [onConfirmDelete]
  )

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null)
  }, [])

  // Filtered chats based on search query
  const filteredChats = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return query
      ? chatHistory.filter(
          (chat) =>
            chat.title?.toLowerCase().includes(query) ||
            chat.id.toLowerCase().includes(query)
        )
      : chatHistory
  }, [chatHistory, searchQuery])

  return {
    // State
    searchQuery,
    editingId,
    editTitle,
    deletingId,
    filteredChats,
    
    // Setters
    setSearchQuery,
    setEditTitle,
    
    // Actions
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    resetStates,
  }
}
