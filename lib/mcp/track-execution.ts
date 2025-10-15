/**
 * MCP Tool Execution Wrapper
 * 
 * Wraps tool execution to automatically track to history
 * Use this in chat API routes for automatic tracking
 */

import { startExecution, completeExecution } from '@/lib/mcp/execution-history'
import { incrementUseCount, getFavorite } from '@/lib/mcp/favorites'

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
      const executionId = startExecution(
        serverId,
        serverName,
        toolName,
        input,
        { tags }
      )
      
      completeExecution(executionId, {
        status,
        output: status === 'success' ? output : undefined,
        error,
        duration
      })

      // Update favorites use count
      const favorite = getFavorite(serverId, toolName)
      if (favorite) {
        incrementUseCount(serverId, toolName)
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
      const executionId = startExecution(
        execution.serverId,
        execution.serverName,
        execution.toolName,
        execution.input,
        { tags: execution.tags || [] }
      )
      
      completeExecution(executionId, {
        status: execution.status || 'success',
        output: execution.output,
        error: execution.error,
        duration: execution.duration || 0
      })

      // Update favorites
      const favorite = getFavorite(execution.serverId, execution.toolName)
      if (favorite) {
        incrementUseCount(execution.serverId, execution.toolName)
      }

      results.success++
    } catch (err) {
      console.error('Failed to track execution:', execution.toolName, err)
      results.failed++
    }
  }

  return results
}
