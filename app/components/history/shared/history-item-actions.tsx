/**
 * Shared components for history item actions
 * Edit and delete forms with consistent UI
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Chats } from "@/lib/chat-store/types"
import { Check, X } from "@phosphor-icons/react"

export type HistoryItemEditProps = {
  chat: Chats
  editTitle: string
  setEditTitle: (title: string) => void
  onSave: (id: string) => void
  onCancel: () => void
}

export type HistoryItemDeleteProps = {
  chat: Chats
  onConfirm: (id: string) => void
  onCancel: () => void
}

/**
 * Edit form for history item title
 */
export function HistoryItemEdit({
  chat,
  editTitle,
  setEditTitle,
  onSave,
  onCancel,
}: HistoryItemEditProps) {
  return (
    <form
      className="flex w-full items-center justify-between"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(chat.id)
      }}
    >
      <Input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="border-input h-8 flex-1 rounded border bg-transparent px-3 py-1 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onSave(chat.id)
          } else if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
          }
        }}
      />
      <div className="ml-2 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/edit-confirm text-muted-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="submit"
              aria-label="Confirm"
            >
              <Check className="group-hover/edit-confirm:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Confirm</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/edit-cancel text-muted-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X className="group-hover/edit-cancel:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel</TooltipContent>
        </Tooltip>
      </div>
    </form>
  )
}

/**
 * Delete confirmation for history item
 */
export function HistoryItemDelete({
  chat,
  onConfirm,
  onCancel,
}: HistoryItemDeleteProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onConfirm(chat.id)
      }}
      className="flex w-full items-center justify-between"
    >
      <div className="flex flex-1 items-center">
        <span className="line-clamp-1 text-base font-normal">{chat.title}</span>
        <input
          type="text"
          className="sr-only hidden"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              onCancel()
            } else if (e.key === "Enter") {
              e.preventDefault()
              onConfirm(chat.id)
            }
          }}
        />
      </div>
      <div className="ml-2 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/delete-confirm text-muted-foreground hover:text-destructive-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="submit"
              aria-label="Confirm"
            >
              <Check className="group-hover/delete-confirm:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Confirm delete</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/delete-cancel text-muted-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X className="group-hover/delete-cancel:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel</TooltipContent>
        </Tooltip>
      </div>
    </form>
  )
}
