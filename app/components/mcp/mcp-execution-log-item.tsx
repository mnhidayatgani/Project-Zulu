'use client'

import * as React from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  formatDuration,
  getStatusColor,
  type ExecutionRecord
} from '@/lib/mcp/execution-history'

interface MCPExecutionLogItemProps {
  execution: ExecutionRecord
  onRerun?: (execution: ExecutionRecord) => void
  onDelete?: (executionId: string) => void
  className?: string
}

/**
 * Individual execution log item with details
 */
export function MCPExecutionLogItem({
  execution,
  onRerun,
  onDelete,
  className
}: MCPExecutionLogItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleCopyInput = () => {
    navigator.clipboard.writeText(JSON.stringify(execution.input, null, 2))
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(JSON.stringify(execution.output, null, 2))
  }

  const handleCopyError = () => {
    if (execution.error) {
      navigator.clipboard.writeText(execution.error)
    }
  }

  const statusIcon = React.useMemo(() => {
    switch (execution.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }, [execution.status])

  const statusBadge = React.useMemo(() => {
    const variants: Record<ExecutionRecord['status'], 'default' | 'destructive' | 'outline' | 'secondary'> = {
      success: 'default',
      error: 'destructive',
      pending: 'outline',
      cancelled: 'secondary'
    }

    return (
      <Badge variant={variants[execution.status]}>
        {execution.status}
      </Badge>
    )
  }, [execution.status])

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn('border rounded-lg overflow-hidden', className)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {statusIcon}
              <h4 className="font-semibold truncate">{execution.toolName}</h4>
              {statusBadge}
              {execution.retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Retry {execution.retryCount}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {execution.serverName}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(execution.startTime).toLocaleString()}
              </span>

              {execution.duration !== undefined && (
                <span>
                  Duration: {formatDuration(execution.duration)}
                </span>
              )}

              {execution.chatId && (
                <span className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Chat
                </span>
              )}
            </div>

            {execution.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {execution.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {execution.error && !isExpanded && (
              <div className="mt-2 p-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-600 dark:text-red-400 line-clamp-2">
                  {execution.error}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {execution.status !== 'pending' && onRerun && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRerun(execution)}
                className="h-8 w-8 p-0"
                title="Re-run execution"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(execution.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10"
                title="Delete execution"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent>
        <div className="border-t p-4 space-y-4 bg-muted/20">
          {/* Execution ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Execution ID
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(execution.id)}
                className="h-6 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <code className="text-xs bg-background px-2 py-1 rounded border block">
              {execution.id}
            </code>
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Input
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInput}
                className="h-6 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="text-xs bg-background px-3 py-2 rounded border overflow-x-auto max-h-40">
              {JSON.stringify(execution.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {execution.output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Output
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOutput}
                  className="h-6 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-background px-3 py-2 rounded border overflow-x-auto max-h-40">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {execution.error && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Error
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyError}
                  className="h-6 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                  {execution.error}
                </p>
              </div>
            </div>
          )}

          {/* Timing Details */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Start Time
              </span>
              <span className="text-xs">
                {new Date(execution.startTime).toLocaleString()}
              </span>
            </div>

            {execution.endTime && (
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  End Time
                </span>
                <span className="text-xs">
                  {new Date(execution.endTime).toLocaleString()}
                </span>
              </div>
            )}

            {execution.duration !== undefined && (
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  Duration
                </span>
                <span className="text-xs">
                  {formatDuration(execution.duration)}
                </span>
              </div>
            )}

            {execution.retryCount > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  Retry Count
                </span>
                <span className="text-xs">
                  {execution.retryCount}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {execution.notes && (
            <div className="pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Notes
              </span>
              <p className="text-sm">{execution.notes}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
