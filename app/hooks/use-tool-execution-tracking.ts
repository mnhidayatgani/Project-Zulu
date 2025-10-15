/**
 * MCP Tool Execution Tracking Hook
 * 
 * Automatically tracks tool executions from chat and updates:
 * - Execution history
 * - Favorites use count
 * - Analytics data
 */

"use client"

import { useEffect, useCallback } from "react"
import { 
  recordExecution, 
  type ToolExecution 
} from "@/lib/mcp/execution-history"
import { 
  incrementFavoriteUseCount, 
  getFavoriteByTool 
} from "@/lib/mcp/favorites"

/**
 * Hook to track tool executions
 */
export function useToolExecutionTracking() {
  /**
   * Track a tool execution
   * Records to history and updates favorites count
   */
  const trackExecution = useCallback(async (params: {
    toolName: string
    serverId: string
    serverName: string
    input: Record<string, unknown>
    output?: unknown
    error?: string
    duration?: number
    status?: 'success' | 'error' | 'pending' | 'cancelled'
  }) => {
    const {
      toolName,
      serverId,
      serverName,
      input,
      output,
      error,
      duration = 0,
      status = error ? 'error' : 'success'
    } = params

    try {
      // Record execution to history
      const execution: Omit<ToolExecution, 'id' | 'timestamp'> = {
        toolName,
        serverId,
        serverName,
        input,
        output,
        error,
        duration,
        status,
        tags: []
      }

      recordExecution(execution)

      // Update favorites use count if tool is favorited
      const favorite = getFavoriteByTool(serverId, toolName)
      if (favorite) {
        incrementFavoriteUseCount(favorite.id)
      }

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('mcp:execution-tracked', {
        detail: { toolName, serverId, status }
      }))

      return true
    } catch (err) {
      console.error('Failed to track tool execution:', err)
      return false
    }
  }, [])

  /**
   * Track execution from Vercel AI SDK tool call
   * Compatible with tool invocation format
   */
  const trackToolInvocation = useCallback(async (params: {
    toolCallId: string
    toolName: string
    serverId: string
    serverName: string
    args: Record<string, unknown>
    result?: unknown
    state?: 'result' | 'partial-call' | 'call'
  }) => {
    const { 
      toolName, 
      serverId, 
      serverName, 
      args, 
      result, 
      state 
    } = params

    // Only track completed calls
    if (state !== 'result') {
      return false
    }

    return trackExecution({
      toolName,
      serverId,
      serverName,
      input: args,
      output: result,
      status: result ? 'success' : 'error',
      duration: 0 // Will be calculated if timing data available
    })
  }, [trackExecution])

  /**
   * Start tracking a tool execution
   * Returns function to complete the tracking with result/error
   */
  const startTracking = useCallback((params: {
    toolName: string
    serverId: string
    serverName: string
    input: Record<string, unknown>
  }) => {
    const startTime = Date.now()
    const { toolName, serverId, serverName, input } = params

    return {
      /**
       * Complete tracking with success
       */
      success: async (output: unknown) => {
        const duration = Date.now() - startTime
        return trackExecution({
          toolName,
          serverId,
          serverName,
          input,
          output,
          duration,
          status: 'success'
        })
      },

      /**
       * Complete tracking with error
       */
      error: async (error: Error | string) => {
        const duration = Date.now() - startTime
        return trackExecution({
          toolName,
          serverId,
          serverName,
          input,
          error: error instanceof Error ? error.message : error,
          duration,
          status: 'error'
        })
      },

      /**
       * Cancel tracking
       */
      cancel: async () => {
        const duration = Date.now() - startTime
        return trackExecution({
          toolName,
          serverId,
          serverName,
          input,
          duration,
          status: 'cancelled'
        })
      }
    }
  }, [trackExecution])

  return {
    trackExecution,
    trackToolInvocation,
    startTracking
  }
}

/**
 * Setup global tool execution tracking
 * Call this once in your app to enable automatic tracking
 */
export function setupGlobalToolTracking() {
  // Listen for tool execution events from chat
  if (typeof window !== 'undefined') {
    const handleToolExecution = (event: CustomEvent) => {
      const { trackExecution } = useToolExecutionTracking()
      trackExecution(event.detail)
    }

    window.addEventListener('mcp:tool-executed' as any, handleToolExecution)

    return () => {
      window.removeEventListener('mcp:tool-executed' as any, handleToolExecution)
    }
  }
}

/**
 * Utility to dispatch tool execution event
 * Use this from chat components when tools are executed
 */
export function dispatchToolExecution(params: {
  toolName: string
  serverId: string
  serverName: string
  input: Record<string, unknown>
  output?: unknown
  error?: string
  duration?: number
  status?: 'success' | 'error' | 'pending' | 'cancelled'
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mcp:tool-executed', {
      detail: params
    }))
  }
}
