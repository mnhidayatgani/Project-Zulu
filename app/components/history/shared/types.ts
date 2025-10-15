/**
 * Shared types for history components
 */

import type { Chats } from "@/lib/chat-store/types"

export type HistoryBaseProps = {
  chatHistory: Chats[]
  onSaveEdit: (id: string, newTitle: string) => Promise<void>
  onConfirmDelete: (id: string) => Promise<void>
  trigger: React.ReactNode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export type HistoryItemRowProps = {
  chat: Chats
  onEdit: (chat: Chats) => void
  onDelete: (id: string) => void
  editingId: string | null
  deletingId: string | null
  isActive?: boolean
}

export type GroupedChats = {
  [key: string]: Chats[]
}
