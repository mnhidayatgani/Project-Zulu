/**
 * MCP Analytics Module
 * 
 * Track tool usage, server health, and provide insights
 */

import type {
  ToolUsageEvent,
  ServerAnalytics,
  ToolAnalytics,
  AnalyticsSummary,
  ToolCategoryType,
  MCPToolMetadata,
} from './types'
import { categorizeTool, getCategoryDistribution } from './categories'

/**
 * Analytics Store (in-memory for now, can be persisted later)
 */
class AnalyticsStore {
  private usageEvents: ToolUsageEvent[] = []
  private serverConnections: Map<
    string,
    {
      connectedAt: Date
      disconnectedAt?: Date
      failures: number
    }[]
  > = new Map()

  /**
   * Track a tool usage event
   */
  trackToolUsage(event: ToolUsageEvent): void {
    this.usageEvents.push(event)

    // Keep only last 1000 events to prevent memory issues
    if (this.usageEvents.length > 1000) {
      this.usageEvents = this.usageEvents.slice(-1000)
    }
  }

  /**
   * Track server connection
   */
  trackServerConnection(serverId: string, connected: boolean, failure: boolean = false): void {
    const connections = this.serverConnections.get(serverId) || []

    if (connected) {
      // New connection
      connections.push({
        connectedAt: new Date(),
        failures: 0,
      })
    } else {
      // Disconnection
      const lastConnection = connections[connections.length - 1]
      if (lastConnection && !lastConnection.disconnectedAt) {
        lastConnection.disconnectedAt = new Date()
        if (failure) {
          lastConnection.failures += 1
        }
      }
    }

    this.serverConnections.set(serverId, connections)
  }

  /**
   * Get all usage events
   */
  getUsageEvents(
    filters?: {
      serverId?: string
      toolName?: string
      startDate?: Date
      endDate?: Date
      success?: boolean
    }
  ): ToolUsageEvent[] {
    let events = [...this.usageEvents]

    if (filters) {
      if (filters.serverId) {
        events = events.filter((e) => e.serverId === filters.serverId)
      }
      if (filters.toolName) {
        events = events.filter((e) => e.toolName === filters.toolName)
      }
      if (filters.startDate) {
        events = events.filter((e) => e.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        events = events.filter((e) => e.timestamp <= filters.endDate!)
      }
      if (filters.success !== undefined) {
        events = events.filter((e) => e.success === filters.success)
      }
    }

    return events
  }

  /**
   * Get server connections history
   */
  getServerConnections(serverId?: string) {
    if (serverId) {
      return this.serverConnections.get(serverId) || []
    }
    return this.serverConnections
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.usageEvents = []
    this.serverConnections.clear()
  }

  /**
   * Get data for export
   */
  export(): {
    usageEvents: ToolUsageEvent[]
    serverConnections: Record<string, any[]>
  } {
    const connections: Record<string, any[]> = {}
    this.serverConnections.forEach((value, key) => {
      connections[key] = value
    })

    return {
      usageEvents: this.usageEvents,
      serverConnections: connections,
    }
  }
}

/**
 * Global analytics store instance
 */
const analyticsStore = new AnalyticsStore()

/**
 * Track tool execution
 */
export function trackToolExecution(
  toolName: string,
  serverId: string,
  executionTime: number,
  success: boolean,
  error?: string,
  userId?: string
): void {
  analyticsStore.trackToolUsage({
    toolName,
    serverId,
    timestamp: new Date(),
    executionTime,
    success,
    error,
    userId,
  })
}

/**
 * Track server connection state
 */
export function trackServerConnection(
  serverId: string,
  connected: boolean,
  failure: boolean = false
): void {
  analyticsStore.trackServerConnection(serverId, connected, failure)
}

/**
 * Get tool analytics
 */
export function getToolAnalytics(
  toolName: string,
  serverId: string,
  tools: MCPToolMetadata[]
): ToolAnalytics {
  const events = analyticsStore.getUsageEvents({ toolName, serverId })

  const successCount = events.filter((e) => e.success).length
  const failureCount = events.filter((e) => !e.success).length
  const totalTime = events.reduce((sum, e) => sum + e.executionTime, 0)
  const avgTime = events.length > 0 ? totalTime / events.length : 0

  const tool = tools.find((t) => t.name === toolName && t.serverId === serverId)
  const category = tool ? categorizeTool(tool) : undefined

  return {
    toolName,
    serverId,
    usageCount: events.length,
    successCount,
    failureCount,
    avgExecutionTime: Math.round(avgTime),
    successRate: events.length > 0 ? successCount / events.length : 0,
    firstUsedAt: events.length > 0 ? events[0].timestamp : undefined,
    lastUsedAt: events.length > 0 ? events[events.length - 1].timestamp : undefined,
    category,
  }
}

/**
 * Get server analytics
 */
export function getServerAnalytics(serverId: string): ServerAnalytics {
  const events = analyticsStore.getUsageEvents({ serverId })
  const connections = analyticsStore.getServerConnections(serverId)

  const successCount = events.filter((e) => e.success).length
  const failureCount = events.filter((e) => !e.success).length
  const totalTime = events.reduce((sum, e) => sum + e.executionTime, 0)
  const avgTime = events.length > 0 ? totalTime / events.length : 0

  // Calculate uptime
  let totalConnectionTime = 0
  let connectionFailures = 0

  connections.forEach((conn) => {
    const start = conn.connectedAt.getTime()
    const end = conn.disconnectedAt?.getTime() || Date.now()
    totalConnectionTime += end - start
    connectionFailures += conn.failures
  })

  // Uptime is time connected / total time since first connection
  const firstConnection = connections[0]?.connectedAt
  const totalTimeSinceFirst = firstConnection
    ? Date.now() - firstConnection.getTime()
    : 1

  const uptimePercentage = (totalConnectionTime / totalTimeSinceFirst) * 100

  return {
    serverId,
    totalExecutions: events.length,
    successfulExecutions: successCount,
    failedExecutions: failureCount,
    avgExecutionTime: Math.round(avgTime),
    uptimePercentage: Math.min(100, Math.max(0, uptimePercentage)),
    firstConnectedAt: firstConnection,
    lastActiveAt: events.length > 0 ? events[events.length - 1].timestamp : undefined,
    totalConnectionTime,
    connectionFailures,
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(
  serverIds: string[],
  tools: MCPToolMetadata[],
  periodStart?: Date,
  periodEnd?: Date
): AnalyticsSummary {
  const events = analyticsStore.getUsageEvents({
    startDate: periodStart,
    endDate: periodEnd,
  })

  // Calculate overall metrics
  const totalServers = serverIds.length
  const activeServers = new Set(events.map((e) => e.serverId)).size

  const successCount = events.filter((e) => e.success).length
  const overallSuccessRate = events.length > 0 ? successCount / events.length : 0

  // Get popular tools
  const toolUsage = new Map<string, number>()
  events.forEach((e) => {
    const key = `${e.serverId}:${e.toolName}`
    toolUsage.set(key, (toolUsage.get(key) || 0) + 1)
  })

  const popularToolsData = Array.from(toolUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key]) => {
      const [serverId, toolName] = key.split(':')
      return getToolAnalytics(toolName, serverId, tools)
    })

  // Get server health
  const serverHealth = serverIds.map((id) => getServerAnalytics(id))

  // Get category distribution
  const categoryDistribution = getCategoryDistribution(tools)

  return {
    totalServers,
    activeServers,
    totalTools: tools.length,
    totalExecutions: events.length,
    overallSuccessRate,
    popularTools: popularToolsData,
    serverHealth,
    categoryDistribution,
    periodStart: periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    periodEnd: periodEnd || new Date(),
  }
}

/**
 * Get popular tools
 */
export function getPopularTools(
  limit: number = 10,
  serverId?: string
): Array<{ toolName: string; serverId: string; count: number }> {
  const events = analyticsStore.getUsageEvents({ serverId })

  const usage = new Map<string, number>()
  events.forEach((e) => {
    const key = `${e.serverId}:${e.toolName}`
    usage.set(key, (usage.get(key) || 0) + 1)
  })

  return Array.from(usage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => {
      const [sid, toolName] = key.split(':')
      return { toolName, serverId: sid, count }
    })
}

/**
 * Get success rate for a tool
 */
export function getToolSuccessRate(toolName: string, serverId: string): number {
  const events = analyticsStore.getUsageEvents({ toolName, serverId })
  if (events.length === 0) return 0

  const successCount = events.filter((e) => e.success).length
  return successCount / events.length
}

/**
 * Export analytics data
 */
export function exportAnalytics(): any {
  return analyticsStore.export()
}

/**
 * Clear analytics data
 */
export function clearAnalytics(): void {
  analyticsStore.clear()
}

/**
 * Get analytics for time period
 */
export function getAnalyticsForPeriod(
  days: number = 7
): {
  totalExecutions: number
  successRate: number
  avgExecutionTime: number
  topTools: Array<{ toolName: string; count: number }>
} {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const events = analyticsStore.getUsageEvents({ startDate })

  const successCount = events.filter((e) => e.success).length
  const totalTime = events.reduce((sum, e) => sum + e.executionTime, 0)

  const toolCounts = new Map<string, number>()
  events.forEach((e) => {
    toolCounts.set(e.toolName, (toolCounts.get(e.toolName) || 0) + 1)
  })

  const topTools = Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([toolName, count]) => ({ toolName, count }))

  return {
    totalExecutions: events.length,
    successRate: events.length > 0 ? successCount / events.length : 0,
    avgExecutionTime: events.length > 0 ? Math.round(totalTime / events.length) : 0,
    topTools,
  }
}

export { analyticsStore }
