'use client'

/**
 * MCP Connection Indicator
 * 
 * Visual indicator showing WebSocket connection status
 * Displays connection state with color-coded badges
 */

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WebSocketConnectionState } from '@/lib/mcp/websocket-client'

export interface ConnectionIndicatorProps {
  /** Server ID to monitor */
  serverId: string
  /** Current connection state */
  state: WebSocketConnectionState
  /** Show label text */
  showLabel?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

/**
 * Get status config based on connection state
 */
function getStatusConfig(status: WebSocketConnectionState['status']) {
  switch (status) {
    case 'connected':
      return {
        icon: Wifi,
        label: 'Connected',
        color: 'bg-green-500',
        badgeVariant: 'default' as const,
        description: 'Connection is active and healthy',
      }
    case 'connecting':
      return {
        icon: Loader2,
        label: 'Connecting',
        color: 'bg-blue-500',
        badgeVariant: 'secondary' as const,
        description: 'Establishing connection...',
      }
    case 'reconnecting':
      return {
        icon: Loader2,
        label: 'Reconnecting',
        color: 'bg-yellow-500',
        badgeVariant: 'secondary' as const,
        description: 'Attempting to reconnect...',
      }
    case 'disconnected':
      return {
        icon: WifiOff,
        label: 'Disconnected',
        color: 'bg-gray-500',
        badgeVariant: 'outline' as const,
        description: 'Not connected',
      }
    case 'error':
      return {
        icon: AlertCircle,
        label: 'Error',
        color: 'bg-red-500',
        badgeVariant: 'destructive' as const,
        description: 'Connection error occurred',
      }
  }
}

/**
 * Connection Indicator Component
 */
export function MCPConnectionIndicator({
  serverId,
  state,
  showLabel = false,
  size = 'md',
  className,
}: ConnectionIndicatorProps) {
  const [pulse, setPulse] = useState(false)
  const config = getStatusConfig(state.status)
  const Icon = config.icon

  // Pulse animation when connecting/reconnecting
  useEffect(() => {
    if (state.status === 'connecting' || state.status === 'reconnecting') {
      setPulse(true)
    } else {
      setPulse(false)
    }
  }, [state.status])

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16
  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-medium">{config.label}</div>
      <div className="text-xs text-muted-foreground">{config.description}</div>
      {state.error && (
        <div className="text-xs text-red-400 mt-2">
          Error: {state.error}
        </div>
      )}
      {state.reconnectAttempts > 0 && (
        <div className="text-xs text-muted-foreground">
          Reconnect attempts: {state.reconnectAttempts}
        </div>
      )}
      {state.lastConnectedAt && (
        <div className="text-xs text-muted-foreground">
          Last connected: {new Date(state.lastConnectedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  )

  if (showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={config.badgeVariant}
              className={cn('flex items-center gap-2', className)}
            >
              <Icon
                size={iconSize}
                className={cn(pulse && 'animate-spin')}
              />
              <span>{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('relative inline-flex', className)}>
            <div
              className={cn(
                dotSize,
                'rounded-full',
                config.color,
                pulse && 'animate-pulse'
              )}
            />
            {state.status === 'connected' && (
              <div
                className={cn(
                  dotSize,
                  'absolute rounded-full animate-ping',
                  config.color,
                  'opacity-75'
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact inline connection indicator
 */
export function MCPConnectionDot({
  state,
  className,
}: {
  state: WebSocketConnectionState
  className?: string
}) {
  const config = getStatusConfig(state.status)

  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        config.color,
        state.status === 'connecting' && 'animate-pulse',
        state.status === 'reconnecting' && 'animate-pulse',
        className
      )}
      title={config.label}
    />
  )
}
