import { Message as MessageType } from "@ai-sdk/react"
import React, { memo, useState } from "react"
import { MessageAssistant } from "./message-assistant"
import { MessageUser } from "./message-user"

type MessageProps = {
  variant: MessageType["role"]
  children: string
  id: string
  attachments?: MessageType["experimental_attachments"]
  isLast?: boolean
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  hasScrollAnchor?: boolean
  parts?: MessageType["parts"]
  status?: "streaming" | "ready" | "submitted" | "error"
  className?: string
  onQuote?: (text: string, messageId: string) => void
}

const MessageComponent = ({
  variant,
  children,
  id,
  attachments,
  isLast,
  onDelete,
  onEdit,
  onReload,
  hasScrollAnchor,
  parts,
  status,
  className,
  onQuote,
}: MessageProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  if (variant === "user") {
    return (
      <MessageUser
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        onEdit={onEdit}
        onDelete={onDelete}
        id={id}
        hasScrollAnchor={hasScrollAnchor}
        attachments={attachments}
        className={className}
      >
        {children}
      </MessageUser>
    )
  }

  if (variant === "assistant") {
    return (
      <MessageAssistant
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        isLast={isLast}
        hasScrollAnchor={hasScrollAnchor}
        parts={parts}
        status={status}
        className={className}
        messageId={id}
        onQuote={onQuote}
      >
        {children}
      </MessageAssistant>
    )
  }

  return null
}

// Memoized version with custom comparison
export const Message = memo(MessageComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.children === nextProps.children &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.status === nextProps.status &&
    prevProps.hasScrollAnchor === nextProps.hasScrollAnchor &&
    prevProps.variant === nextProps.variant &&
    // Deep compare parts if they exist
    JSON.stringify(prevProps.parts) === JSON.stringify(nextProps.parts) &&
    JSON.stringify(prevProps.attachments) === JSON.stringify(nextProps.attachments)
  )
})

Message.displayName = "Message"
