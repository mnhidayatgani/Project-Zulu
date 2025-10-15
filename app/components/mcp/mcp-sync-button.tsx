'use client'

/**
 * MCP Sync Button Component
 * 
 * Manual trigger for forcing sync operation.
 * Shows loading state and sync result.
 */

import React, { useState } from 'react'
import { ArrowsClockwise, Check, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface MCPSyncButtonProps {
  onSyncComplete?: (success: boolean, message: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
}

export function MCPSyncButton({
  onSyncComplete,
  className,
  variant = 'outline',
  size = 'default',
  iconOnly = false
}: MCPSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<{
    success: boolean
    message: string
    timestamp: Date
  } | null>(null)

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    setLastResult(null)

    try {
      // Dynamic import to avoid SSR issues
      const { forceSyncNow } = await import('@/lib/mcp/sync')
      
      const result = await forceSyncNow()
      
      // Calculate total synced items from all categories
      const totalSynced = 
        result.pulled.favorites.synced +
        result.pulled.executions.synced +
        result.pulled.searches.synced +
        result.pushed.favorites.synced +
        result.pushed.executions.synced +
        result.pushed.searches.synced
      
      // Calculate total errors
      const totalErrors =
        result.pulled.favorites.errors.length +
        result.pulled.executions.errors.length +
        result.pulled.searches.errors.length +
        result.pushed.favorites.errors.length +
        result.pushed.executions.errors.length +
        result.pushed.searches.errors.length
      
      const success = result.success && totalErrors === 0
      const message = success
        ? `Synced ${totalSynced} items successfully`
        : `Sync completed with ${totalErrors} error(s)`

      setLastResult({
        success,
        message,
        timestamp: new Date()
      })

      onSyncComplete?.(success, message)

      // Clear result after 3 seconds
      setTimeout(() => setLastResult(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      
      setLastResult({
        success: false,
        message: errorMessage,
        timestamp: new Date()
      })

      onSyncComplete?.(false, errorMessage)

      setTimeout(() => setLastResult(null), 3000)
    } finally {
      setIsSyncing(false)
    }
  }

  const getButtonIcon = () => {
    if (lastResult) {
      return lastResult.success ? (
        <Check className="h-4 w-4" weight="bold" />
      ) : (
        <Warning className="h-4 w-4" weight="fill" />
      )
    }
    return (
      <ArrowsClockwise
        className={cn('h-4 w-4', isSyncing && 'animate-spin')}
        weight="bold"
      />
    )
  }

  const getButtonText = () => {
    if (isSyncing) return 'Syncing...'
    if (lastResult) {
      return lastResult.success ? 'Synced!' : 'Error'
    }
    return 'Sync Now'
  }

  const getTooltipContent = () => {
    if (lastResult) {
      return (
        <div className="text-xs">
          <div className="font-medium">{lastResult.message}</div>
          <div className="text-muted-foreground mt-1">
            {lastResult.timestamp.toLocaleTimeString()}
          </div>
        </div>
      )
    }
    return <div className="text-xs">Force sync all MCP data</div>
  }

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
      className={cn(
        'transition-all',
        lastResult?.success && 'border-green-500 text-green-700 dark:text-green-400',
        lastResult && !lastResult.success && 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
        className
      )}
    >
      {getButtonIcon()}
      {!iconOnly && <span className="ml-2">{getButtonText()}</span>}
    </Button>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom">{getTooltipContent()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
