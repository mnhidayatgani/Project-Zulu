'use client'

/**
 * MCP Server Status Component
 * 
 * Displays detailed status for a WebSocket MCP server
 * Shows connection health, uptime, latency, and controls
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Power, 
  RefreshCw, 
  Trash2, 
  Settings, 
  Activity,
  Clock,
  Zap,
  Server,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MCPConnectionIndicator } from './mcp-connection-indicator'
import type { ManagedConnection } from '@/lib/mcp/connection-manager'
import type { WebSocketConnectionState } from '@/lib/mcp/websocket-client'

export interface MCPServerStatusProps {
  /** Connection info */
  connection: ManagedConnection
  /** Callback when connecting */
  onConnect?: (serverId: string) => void
  /** Callback when disconnecting */
  onDisconnect?: (serverId: string) => void
  /** Callback when removing server */
  onRemove?: (serverId: string) => void
  /** Callback when configuring */
  onConfigure?: (serverId: string) => void
  /** Show detailed stats */
  detailed?: boolean
  /** Custom className */
  className?: string
}

/**
 * Format uptime duration
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

/**
 * Calculate uptime
 */
function calculateUptime(state: WebSocketConnectionState): number {
  if (state.status !== 'connected' || !state.lastConnectedAt) {
    return 0
  }
  return Date.now() - new Date(state.lastConnectedAt).getTime()
}

/**
 * MCP Server Status Component
 */
export function MCPServerStatus({
  connection,
  onConnect,
  onDisconnect,
  onRemove,
  onConfigure,
  detailed = true,
  className,
}: MCPServerStatusProps) {
  const [uptime, setUptime] = useState(0)
  const { config, state, client } = connection

  // Update uptime every second
  useEffect(() => {
    if (state.status === 'connected') {
      const interval = setInterval(() => {
        setUptime(calculateUptime(state))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state])

  const isConnected = client.isConnected()
  const canConnect = !isConnected && state.status !== 'connecting'
  const canDisconnect = isConnected || state.status === 'connecting'

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base truncate">
                {config.name}
              </CardTitle>
              <MCPConnectionIndicator
                serverId={config.id}
                state={state}
                size="sm"
              />
            </div>
            <CardDescription className="line-clamp-2">
              {config.description}
            </CardDescription>
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            {canConnect && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onConnect?.(config.id)}
                title="Connect"
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDisconnect && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDisconnect?.(config.id)}
                title="Disconnect"
              >
                <Power className="h-3.5 w-3.5 text-red-500" />
              </Button>
            )}
            {onConfigure && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onConfigure(config.id)}
                title="Configure"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(config.id)}
                title="Remove server"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {detailed && (
        <CardContent className="space-y-3">
          {/* Connection URL */}
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <code className="flex-1 truncate bg-muted px-2 py-1 rounded">
              {config.transport.url}
            </code>
          </div>

          {/* Stats Grid */}
          {isConnected && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Uptime */}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Uptime</div>
                  <div className="font-medium">{formatUptime(uptime)}</div>
                </div>
              </div>

              {/* Activity */}
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium text-green-600">Active</div>
                </div>
              </div>
            </div>
          )}

          {/* Reconnection Progress */}
          {state.status === 'reconnecting' && state.reconnectAttempts > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Reconnecting...
                </span>
                <span className="font-medium">
                  Attempt {state.reconnectAttempts}
                </span>
              </div>
              <Progress value={33} className="h-1" />
            </div>
          )}

          {/* Error Message */}
          {state.status === 'error' && state.error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
              {state.error}
            </div>
          )}

          {/* Last Connected */}
          {state.lastConnectedAt && !isConnected && (
            <div className="text-xs text-muted-foreground">
              Last connected: {new Date(state.lastConnectedAt).toLocaleString()}
            </div>
          )}

          {/* Tags */}
          {config.tags && config.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {config.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Compact server status item for lists
 */
export function MCPServerStatusCompact({
  connection,
  onConnect,
  onDisconnect,
  className,
}: Pick<MCPServerStatusProps, 'connection' | 'onConnect' | 'onDisconnect' | 'className'>) {
  const { config, state, client } = connection
  const isConnected = client.isConnected()

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        className
      )}
    >
      <MCPConnectionIndicator
        serverId={config.id}
        state={state}
        size="sm"
      />
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{config.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {config.transport.url}
        </div>
      </div>

      {!isConnected ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onConnect?.(config.id)}
        >
          <Power className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDisconnect?.(config.id)}
        >
          <Power className="h-3.5 w-3.5 text-red-500" />
        </Button>
      )}
    </div>
  )
}
