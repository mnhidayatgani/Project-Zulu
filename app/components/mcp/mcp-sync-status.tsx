'use client'

/**
 * MCP Sync Status Component
 * 
 * Displays the current sync status with last sync time,
 * synced items count, and any errors.
 */

import React, { useEffect, useState } from 'react'
import { CloudArrowUp, Check, Warning, Spinner } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SyncStatus {
  isSyncing: boolean
  lastSync: Date | null
  itemsSynced: number
  errors: string[]
  pending: number
}

interface MCPSyncStatusProps {
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export function MCPSyncStatus({ 
  className,
  showDetails = false,
  compact = false
}: MCPSyncStatusProps) {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    itemsSynced: 0,
    errors: [],
    pending: 0
  })

  // Poll sync status
  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Import dynamically to avoid SSR issues
        const { getSyncStatus } = await import('@/lib/mcp/sync')
        const syncStatus = getSyncStatus()
        
        if (!syncStatus) {
          return
        }
        
        // Calculate totals from sync status
        const itemsSynced = 
          syncStatus.favorites.synced +
          syncStatus.executions.synced +
          syncStatus.searches.synced
        
        const errors = [
          ...syncStatus.favorites.errors,
          ...syncStatus.executions.errors,
          ...syncStatus.searches.errors
        ]
        
        // Get last sync time from any category
        const lastSyncDates = [
          syncStatus.favorites.lastSync,
          syncStatus.executions.lastSync,
          syncStatus.searches.lastSync
        ].filter(Boolean) as Date[]
        
        const lastSync = lastSyncDates.length > 0
          ? new Date(Math.max(...lastSyncDates.map(d => d.getTime())))
          : null
        
        setStatus({
          isSyncing: false, // We don't track this yet
          lastSync,
          itemsSynced,
          errors,
          pending: 0 // We don't track pending changes yet
        })
      } catch (error) {
        console.error('Failed to get sync status:', error)
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <Spinner className="h-3 w-3 animate-spin" weight="bold" />
    }
    if (status.errors.length > 0) {
      return <Warning className="h-3 w-3" weight="fill" />
    }
    if (status.lastSync) {
      return <Check className="h-3 w-3" weight="bold" />
    }
    return <CloudArrowUp className="h-3 w-3" />
  }

  const getStatusColor = () => {
    if (status.isSyncing) return 'blue'
    if (status.errors.length > 0) return 'yellow'
    if (status.lastSync) return 'green'
    return 'gray'
  }

  const getStatusText = () => {
    if (status.isSyncing) return 'Syncing...'
    if (status.errors.length > 0) return 'Sync error'
    if (status.lastSync) return 'Synced'
    return 'Not synced'
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-1.5 cursor-default',
                status.errors.length > 0 && 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
                status.isSyncing && 'border-blue-500 text-blue-700 dark:text-blue-400',
                status.lastSync && !status.errors.length && 'border-green-500 text-green-700 dark:text-green-400',
                className
              )}
            >
              {getStatusIcon()}
              {!compact && <span className="text-xs">{getStatusText()}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <div className="font-medium">{getStatusText()}</div>
              <div className="text-muted-foreground">
                Last sync: {formatTime(status.lastSync)}
              </div>
              {status.itemsSynced > 0 && (
                <div className="text-muted-foreground">
                  Items synced: {status.itemsSynced}
                </div>
              )}
              {status.pending > 0 && (
                <div className="text-muted-foreground">
                  Pending: {status.pending}
                </div>
              )}
              {status.errors.length > 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  {status.errors.length} error(s)
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card', className)}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        status.errors.length > 0 && 'bg-yellow-100 dark:bg-yellow-900/20',
        status.isSyncing && 'bg-blue-100 dark:bg-blue-900/20',
        status.lastSync && !status.errors.length && 'bg-green-100 dark:bg-green-900/20',
        !status.lastSync && !status.isSyncing && 'bg-gray-100 dark:bg-gray-800'
      )}>
        {getStatusIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getStatusText()}</span>
          {status.pending > 0 && (
            <Badge variant="secondary" className="text-xs">
              {status.pending} pending
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Last sync: {formatTime(status.lastSync)}
          {status.itemsSynced > 0 && ` • ${status.itemsSynced} items`}
        </div>
      </div>

      {showDetails && status.errors.length > 0 && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          {status.errors.length} error(s)
        </div>
      )}
    </div>
  )
}
