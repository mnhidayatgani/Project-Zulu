import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useChats } from "@/lib/chat-store/chats/provider"
import { Chats } from "@/lib/chat-store/types"
import {
  MagnifyingGlass,
  PencilSimple,
  TrashSimple,
} from "@phosphor-icons/react"
import { Pin, PinOff } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useCallback, useMemo } from "react"
import { formatDate, groupChatsByDate } from "./utils"
import {
  useHistoryActions,
  HistoryItemEdit,
  HistoryItemDelete,
  type HistoryBaseProps,
} from "./shared"

export function DrawerHistory({
  chatHistory,
  onSaveEdit,
  onConfirmDelete,
  trigger,
  isOpen,
  setIsOpen,
}: HistoryBaseProps) {
  const { pinnedChats, togglePinned } = useChats()
  const params = useParams<{ chatId: string }>()

  // Use shared history actions hook
  const {
    searchQuery,
    setSearchQuery,
    editingId,
    editTitle,
    setEditTitle,
    deletingId,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    resetStates,
  } = useHistoryActions({
    chatHistory,
    onSaveEdit,
    onConfirmDelete,
  })

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        resetStates()
      }
    },
    [setIsOpen, resetStates]
  )

  // Memoize filtered chats to avoid recalculating on every render
  const filteredChat = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return query
      ? chatHistory.filter((chat) =>
          (chat.title || "").toLowerCase().includes(query)
        )
      : chatHistory
  }, [chatHistory, searchQuery])

  // Group chats by time periods - memoized to avoid recalculation
  const groupedChats = useMemo(
    () => groupChatsByDate(chatHistory, searchQuery),
    [chatHistory, searchQuery]
  )

  // Render chat item
  const renderChatItem = useCallback(
    (chat: Chats) => (
      <div key={chat.id}>
        <div className="space-y-1.5">
          {editingId === chat.id ? (
            <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
              <HistoryItemEdit
                chat={chat}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : deletingId === chat.id ? (
            <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
              <HistoryItemDelete
                chat={chat}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            </div>
          ) : (
            <div
              className="group flex items-center justify-between rounded-lg px-2 py-1.5"
              onClick={() => {
                if (params.chatId === chat.id) {
                  handleOpenChange(false)
                }
              }}
            >
              <Link
                href={`/c/${chat.id}`}
                key={chat.id}
                className="flex flex-1 flex-col items-start"
                prefetch
              >
                <span className="line-clamp-1 text-base font-normal">
                  {chat.title || "Untitled Chat"}
                </span>
                <span className="mr-2 text-xs font-normal text-gray-500">
                  {formatDate(chat?.updated_at || chat?.created_at)}
                </span>
              </Link>
              <div className="flex items-center">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground size-8"
                    onClick={(e) => {
                      e.preventDefault()
                      togglePinned(chat.id, !chat.pinned)
                    }}
                    type="button"
                    aria-label={chat.pinned ? "Unpin" : "Pin"}
                  >
                    {chat.pinned ? (
                      <PinOff className="size-4 stroke-[1.5px]" />
                    ) : (
                      <Pin className="size-4 stroke-[1.5px]" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground size-8"
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(chat)
                    }}
                    type="button"
                  >
                    <PencilSimple className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(chat.id)
                    }}
                    type="button"
                  >
                    <TrashSimple className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [
      handleOpenChange,
      params.chatId,
      editingId,
      deletingId,
      editTitle,
      handleSaveEdit,
      handleCancelEdit,
      handleConfirmDelete,
      handleCancelDelete,
      handleEdit,
      handleDelete,
      togglePinned,
    ]
  )

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>History</TooltipContent>
      </Tooltip>
      <DrawerContent>
        <div className="flex h-dvh max-h-[80vh] flex-col">
          <div className="border-b p-4 pb-3">
            <div className="relative">
              <Input
                placeholder="Search..."
                className="rounded-lg py-1.5 pl-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlass className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 transform text-gray-400" />
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="flex flex-col space-y-6 px-4 pt-4 pb-8">
              {filteredChat.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  No chat history found.
                </div>
              ) : searchQuery ? (
                // When searching, display a flat list without grouping
                <div className="space-y-2">
                  {filteredChat.map((chat) => renderChatItem(chat))}
                </div>
              ) : (
                <>
                  {pinnedChats.length > 0 && (
                    <div className="space-y-0.5">
                      <h3 className="text-muted-foreground flex items-center gap-1 pl-2 text-sm font-medium">
                        <Pin className="size-3" />
                        Pinned
                      </h3>
                      <div className="space-y-2">
                        {pinnedChats.map((chat) => renderChatItem(chat))}
                      </div>
                    </div>
                  )}
                  {groupedChats?.map((group) => (
                    <div key={group.name} className="space-y-0.5">
                      <h3 className="text-muted-foreground pl-2 text-sm font-medium">
                        {group.name}
                      </h3>
                      <div className="space-y-2">
                        {group.chats.map((chat) => renderChatItem(chat))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
