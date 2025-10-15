/**
 * MCP Tool Execution Wrapper
 * 
 * Wraps tool execution to automatically track to history
 * Use this in chat API routes for automatic tracking
 */

import { recordExecution } from '@/lib/mcp/execution-history'
import { incrementFavoriteUseCount, getFavoriteByTool } from '@/lib/mcp/favorites'

/**
 * Wrap a tool execution with automatic tracking
 * 
 * @example
 * ```typescript
 * const result = await trackToolExecution({
 *   toolName: 'readFile',
 *   serverId: 'filesystem',
 *   serverName: 'Filesystem MCP',
 *   input: { path: '/tmp/file.txt' },
 *   execute: async () => {
 *     return await fs.readFile('/tmp/file.txt', 'utf8')
 *   }
 * })
 * ```
 */
export async function trackToolExecution<T>(params: {
  toolName: string
  serverId: string
  serverName: string
  input: Record<string, unknown>
  execute: () => Promise<T>
  tags?: string[]
}): Promise<T> {
  const { toolName, serverId, serverName, input, execute, tags = [] } = params
  
  const startTime = Date.now()
  let status: 'success' | 'error' = 'success'
  let output: unknown
  let error: string | undefined

  try {
    // Execute the tool
    output = await execute()
    return output as T
  } catch (err) {
    // Capture error
    status = 'error'
    error = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    // Calculate duration
    const duration = Date.now() - startTime

    try {
      // Record to execution history
      recordExecution({
        toolName,
        serverId,
        serverName,
        input,
        output: status === 'success' ? output : undefined,
        error,
        duration,
        status,
        tags
      })

      // Update favorites use count
      const favorite = getFavoriteByTool(serverId, toolName)
      if (favorite) {
        incrementFavoriteUseCount(favorite.id)
      }
    } catch (trackingErr) {
      // Don't fail the tool execution if tracking fails
      console.error('Failed to track tool execution:', trackingErr)
    }
  }
}

/**
 * Create a tracked tool function
 * Returns a function that automatically tracks execution
 * 
 * @example
 * ```typescript
 * const readFile = createTrackedTool({
 *   toolName: 'readFile',
 *   serverId: 'filesystem',
 *   serverName: 'Filesystem MCP',
 *   execute: async (args: { path: string }) => {
 *     return await fs.readFile(args.path, 'utf8')
 *   }
 * })
 * 
 * // Usage
 * const content = await readFile({ path: '/tmp/file.txt' })
 * ```
 */
export function createTrackedTool<TInput extends Record<string, unknown>, TOutput>(params: {
  toolName: string
  serverId: string
  serverName: string
  execute: (input: TInput) => Promise<TOutput>
  tags?: string[]
}) {
  const { toolName, serverId, serverName, execute, tags = [] } = params

  return async (input: TInput): Promise<TOutput> => {
    return trackToolExecution({
      toolName,
      serverId,
      serverName,
      input,
      execute: () => execute(input),
      tags
    })
  }
}

/**
 * Batch track multiple tool executions
 * Useful for tracking multiple tools at once
 */
export async function batchTrackExecutions(executions: Array<{
  toolName: string
  serverId: string
  serverName: string
  input: Record<string, unknown>
  output?: unknown
  error?: string
  duration?: number
  status?: 'success' | 'error' | 'pending' | 'cancelled'
  tags?: string[]
}>) {
  const results = {
    success: 0,
    failed: 0,
    total: executions.length
  }

  for (const execution of executions) {
    try {
      recordExecution({
        toolName: execution.toolName,
        serverId: execution.serverId,
        serverName: execution.serverName,
        input: execution.input,
        output: execution.output,
        error: execution.error,
        duration: execution.duration || 0,
        status: execution.status || 'success',
        tags: execution.tags || []
      })

      // Update favorites
      const favorite = getFavoriteByTool(execution.serverId, execution.toolName)
      if (favorite) {
        incrementFavoriteUseCount(favorite.id)
      }

      results.success++
    } catch (err) {
      console.error('Failed to track execution:', execution.toolName, err)
      results.failed++
    }
  }

  return results
}
