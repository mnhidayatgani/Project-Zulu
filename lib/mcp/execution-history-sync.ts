/**
 * Supabase Persistence for MCP Execution History
 * 
 * Syncs execution history between localStorage and Supabase
 */

import { createClient } from '@/lib/supabase/client'
import type { ToolExecution } from './execution-history'
import type { ExecutionRecord } from './execution-history'
import {
  getRecentExecutions as getLocalHistory,
  loadExecutionHistory,
  saveExecutionHistory,
  clearExecutionHistory as clearLocalHistory,
  startExecution,
  completeExecution,
} from './execution-history'

/**
 * Database type for execution history
 */
export interface DBExecution {
  id: string
  user_id: string
  tool_name: string
  server_id: string
  server_name: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  duration?: number
  status: 'success' | 'error' | 'pending' | 'cancelled'
  tags?: string[]
  executed_at: string
}

/**
 * Sync execution history from Supabase to localStorage
 */
export async function syncExecutionHistoryFromDB(limit = 500): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, error: 'Not authenticated' }
    }

    // Fetch execution history from Supabase
    const { data: dbExecutions, error } = await supabase
      .from('mcp_execution_history')
      .select('*')
      .eq('user_id', user.id)
      .order('executed_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    if (!dbExecutions || dbExecutions.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert DB executions to local format
    const localExecutions: ToolExecution[] = dbExecutions.map(dbExec => ({
      id: dbExec.id,
      toolName: dbExec.tool_name,
      serverId: dbExec.server_id,
      serverName: dbExec.server_name,
      input: dbExec.input,
      output: dbExec.output,
      error: dbExec.error,
      duration: dbExec.duration,
      status: dbExec.status,
      tags: dbExec.tags || [],
      timestamp: new Date(dbExec.executed_at)
    }))

    // Save to localStorage (replace local data)
    localStorage.setItem('mcp-execution-history', JSON.stringify(localExecutions))

    return { success: true, synced: localExecutions.length }
  } catch (error) {
    console.error('Failed to sync execution history from DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Sync execution history from localStorage to Supabase
 */
export async function syncExecutionHistoryToDB(): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, error: 'Not authenticated' }
    }

    // Get local execution history
    const localExecutions = getLocalHistory()
    
    if (localExecutions.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert to DB format
    const dbExecutions = localExecutions.map(exec => ({
      id: exec.id,
      user_id: user.id,
      tool_name: exec.toolName,
      server_id: exec.serverId,
      server_name: exec.serverName,
      input: exec.input,
      output: exec.output,
      error: exec.error,
      duration: exec.duration,
      status: exec.status,
      tags: exec.tags,
      executed_at: exec.timestamp.toISOString()
    }))

    // Upsert to Supabase
    const { error } = await supabase
      .from('mcp_execution_history')
      .upsert(dbExecutions, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    return { success: true, synced: dbExecutions.length }
  } catch (error) {
    console.error('Failed to sync execution history to DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Record execution and sync to Supabase
 */
export async function recordExecutionWithSync(
  execution: Omit<ToolExecution, 'id' | 'timestamp'>
): Promise<boolean> {
  try {
    // Record locally first - start execution
    const executionId = startExecution(
      execution.tool_name,
      execution.server_id,
      execution.server_name,
      execution.input
    )
    
    // Complete with output if available
    if (execution.output !== undefined || execution.error) {
      completeExecution(executionId, execution.output || {}, execution.error, execution.status || 'success')
    }

    // Sync to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // No user, but local record succeeded
      return true
    }

    const { error } = await supabase
      .from('mcp_execution_history')
      .insert({
        user_id: user.id,
        tool_name: execution.toolName,
        server_id: execution.serverId,
        server_name: execution.serverName,
        input: execution.input,
        output: execution.output,
        error: execution.error,
        duration: execution.duration,
        status: execution.status,
        tags: execution.tags
      })

    if (error) {
      console.error('Failed to sync execution to DB:', error)
      // Don't fail if sync fails
    }

    return true
  } catch (error) {
    console.error('Failed to record execution with sync:', error)
    return false
  }
}

/**
 * Clear execution history and sync to Supabase
 */
export async function clearExecutionHistoryWithSync(): Promise<boolean> {
  try {
    // Clear localStorage
    clearLocalHistory()

    // Clear Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return true
    }

    const { error } = await supabase
      .from('mcp_execution_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to clear execution history in DB:', error)
      // Don't fail if sync fails
    }

    return true
  } catch (error) {
    console.error('Failed to clear execution history with sync:', error)
    return false
  }
}

/**
 * Get execution statistics from Supabase
 * More accurate than localStorage for long-term data
 */
export async function getExecutionStatisticsFromDB() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    // Get statistics using SQL
    const { data, error } = await supabase.rpc('get_execution_statistics', {
      p_user_id: user.id
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to get execution statistics from DB:', error)
    return null
  }
}

/**
 * Setup bidirectional sync for execution history
 */
export async function setupExecutionHistorySync(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    // Sync from DB to local on startup (last 500 executions)
    await syncExecutionHistoryFromDB(500)

    // Setup realtime subscription
    const channel = supabase
      .channel('mcp_execution_history_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mcp_execution_history',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New execution recorded:', payload)
          // Add to local storage
          if (payload.new) {
            const dbExec = payload.new as DBExecution
            const localExec: ToolExecution = {
              id: dbExec.id,
              toolName: dbExec.tool_name,
              serverId: dbExec.server_id,
              serverName: dbExec.server_name,
              input: dbExec.input,
              output: dbExec.output,
              error: dbExec.error,
              duration: dbExec.duration,
              status: dbExec.status,
              tags: dbExec.tags || [],
              timestamp: new Date(dbExec.executed_at)
            }

            // Add to localStorage
            const history = getLocalHistory()
            history.unshift(localExec)
            
            // Keep only last 500
            if (history.length > 500) {
              history.splice(500)
            }

            localStorage.setItem('mcp-execution-history', JSON.stringify(history))
          }
        }
      )
      .subscribe()

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        channel.unsubscribe()
      })
    }
  } catch (error) {
    console.error('Failed to setup execution history sync:', error)
  }
}

/**
 * Batch sync executions to Supabase
 * Useful for syncing many executions at once
 */
export async function batchSyncExecutions(
  executions: ToolExecution[]
): Promise<{
  success: boolean
  synced: number
  failed: number
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, failed: executions.length }
    }

    // Convert to DB format
    const dbExecutions = executions.map(exec => ({
      id: exec.id,
      user_id: user.id,
      tool_name: exec.toolName,
      server_id: exec.serverId,
      server_name: exec.serverName,
      input: exec.input,
      output: exec.output,
      error: exec.error,
      duration: exec.duration,
      status: exec.status,
      tags: exec.tags,
      executed_at: exec.timestamp.toISOString()
    }))

    // Insert in batches of 100 to avoid limits
    const batchSize = 100
    let synced = 0
    let failed = 0

    for (let i = 0; i < dbExecutions.length; i += batchSize) {
      const batch = dbExecutions.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('mcp_execution_history')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: true
        })

      if (error) {
        console.error('Batch sync failed:', error)
        failed += batch.length
      } else {
        synced += batch.length
      }
    }

    return {
      success: failed === 0,
      synced,
      failed
    }
  } catch (error) {
    console.error('Failed to batch sync executions:', error)
    return {
      success: false,
      synced: 0,
      failed: executions.length
    }
  }
}
