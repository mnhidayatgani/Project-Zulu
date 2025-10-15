/**
 * MCP Tool Execution History
 * 
 * Features:
 * - Track tool executions
 * - Store execution results
 * - Re-run previous executions
 * - Export execution logs
 * - Analyze execution patterns
 */

export interface ExecutionRecord {
  id: string
  serverId: string
  serverName: string
  toolName: string
  toolDescription?: string
  
  // Execution details
  input: Record<string, any>
  output: any
  status: 'success' | 'error' | 'pending' | 'cancelled'
  error?: string
  
  // Timing
  startTime: string
  endTime?: string
  duration?: number // milliseconds
  
  // Context
  chatId?: string
  messageId?: string
  userId?: string
  
  // Metadata
  retryCount: number
  parentExecutionId?: string // For re-runs
  tags: string[]
  notes?: string
}

export interface ExecutionStats {
  totalExecutions: number
  successCount: number
  errorCount: number
  averageDuration: number
  mostUsedTools: Array<{ toolName: string; count: number }>
  recentErrors: ExecutionRecord[]
  executionsByDay: Array<{ date: string; count: number }>
  executionsByTool: Array<{ toolName: string; count: number }>
}

export interface ExecutionFilter {
  serverId?: string
  toolName?: string
  status?: ExecutionRecord['status']
  startDate?: string
  endDate?: string
  hasError?: boolean
  tags?: string[]
}

const STORAGE_KEY = 'mcp-execution-history'
const MAX_HISTORY = 500
const MAX_EXECUTION_TIME = 300000 // 5 minutes

/**
 * Load execution history
 */
export function loadExecutionHistory(): ExecutionRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return []
    }

    const history = JSON.parse(data)
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Failed to load execution history:', error)
    return []
  }
}

/**
 * Save execution history
 */
export function saveExecutionHistory(history: ExecutionRecord[]): void {
  if (typeof window === 'undefined') return

  try {
    // Keep only most recent MAX_HISTORY records
    const trimmed = history.slice(0, MAX_HISTORY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save execution history:', error)
  }
}

/**
 * Generate unique execution ID
 */
export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Start execution tracking
 */
export function startExecution(
  serverId: string,
  serverName: string,
  toolName: string,
  input: Record<string, any>,
  options?: {
    toolDescription?: string
    chatId?: string
    messageId?: string
    userId?: string
    tags?: string[]
    parentExecutionId?: string
  }
): ExecutionRecord {
  const execution: ExecutionRecord = {
    id: generateExecutionId(),
    serverId,
    serverName,
    toolName,
    toolDescription: options?.toolDescription,
    input,
    output: null,
    status: 'pending',
    startTime: new Date().toISOString(),
    retryCount: 0,
    chatId: options?.chatId,
    messageId: options?.messageId,
    userId: options?.userId,
    parentExecutionId: options?.parentExecutionId,
    tags: options?.tags || []
  }

  const history = loadExecutionHistory()
  const updated = [execution, ...history].slice(0, MAX_HISTORY)
  saveExecutionHistory(updated)

  return execution
}

/**
 * Complete execution
 */
export function completeExecution(
  executionId: string,
  result: {
    output?: any
    error?: string
    status?: 'success' | 'error' | 'cancelled'
  }
): ExecutionRecord | undefined {
  const history = loadExecutionHistory()
  const execution = history.find(e => e.id === executionId)

  if (!execution) {
    return undefined
  }

  const endTime = new Date().toISOString()
  const duration = new Date(endTime).getTime() - new Date(execution.startTime).getTime()

  const updated: ExecutionRecord = {
    ...execution,
    output: result.output,
    error: result.error,
    status: result.status || (result.error ? 'error' : 'success'),
    endTime,
    duration
  }

  const updatedHistory = history.map(e => e.id === executionId ? updated : e)
  saveExecutionHistory(updatedHistory)

  return updated
}

/**
 * Update execution
 */
export function updateExecution(
  executionId: string,
  updates: Partial<ExecutionRecord>
): ExecutionRecord | undefined {
  const history = loadExecutionHistory()
  const execution = history.find(e => e.id === executionId)

  if (!execution) {
    return undefined
  }

  const updated = { ...execution, ...updates }
  const updatedHistory = history.map(e => e.id === executionId ? updated : e)
  saveExecutionHistory(updatedHistory)

  return updated
}

/**
 * Delete execution
 */
export function deleteExecution(executionId: string): void {
  const history = loadExecutionHistory()
  const updated = history.filter(e => e.id !== executionId)
  saveExecutionHistory(updated)
}

/**
 * Get execution by ID
 */
export function getExecution(executionId: string): ExecutionRecord | undefined {
  const history = loadExecutionHistory()
  return history.find(e => e.id === executionId)
}

/**
 * Filter executions
 */
export function filterExecutions(
  filter: ExecutionFilter
): ExecutionRecord[] {
  let history = loadExecutionHistory()

  if (filter.serverId) {
    history = history.filter(e => e.serverId === filter.serverId)
  }

  if (filter.toolName) {
    history = history.filter(e => e.toolName === filter.toolName)
  }

  if (filter.status) {
    history = history.filter(e => e.status === filter.status)
  }

  if (filter.startDate) {
    const startDate = new Date(filter.startDate).getTime()
    history = history.filter(e => new Date(e.startTime).getTime() >= startDate)
  }

  if (filter.endDate) {
    const endDate = new Date(filter.endDate).getTime()
    history = history.filter(e => new Date(e.startTime).getTime() <= endDate)
  }

  if (filter.hasError !== undefined) {
    history = history.filter(e => filter.hasError ? !!e.error : !e.error)
  }

  if (filter.tags && filter.tags.length > 0) {
    history = history.filter(e => filter.tags!.some(tag => e.tags.includes(tag)))
  }

  return history
}

/**
 * Get recent executions
 */
export function getRecentExecutions(limit: number = 20): ExecutionRecord[] {
  const history = loadExecutionHistory()
  return history.slice(0, limit)
}

/**
 * Get executions for tool
 */
export function getToolExecutions(
  serverId: string,
  toolName: string,
  limit?: number
): ExecutionRecord[] {
  const history = loadExecutionHistory()
  const filtered = history.filter(
    e => e.serverId === serverId && e.toolName === toolName
  )
  return limit ? filtered.slice(0, limit) : filtered
}

/**
 * Get execution statistics
 */
export function getExecutionStats(): ExecutionStats {
  const history = loadExecutionHistory()

  const totalExecutions = history.length
  const successCount = history.filter(e => e.status === 'success').length
  const errorCount = history.filter(e => e.status === 'error').length

  // Average duration
  const completedExecutions = history.filter(e => e.duration !== undefined)
  const totalDuration = completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0)
  const averageDuration = completedExecutions.length > 0
    ? totalDuration / completedExecutions.length
    : 0

  // Most used tools
  const toolCounts = new Map<string, number>()
  for (const execution of history) {
    const key = `${execution.serverId}:${execution.toolName}`
    toolCounts.set(key, (toolCounts.get(key) || 0) + 1)
  }

  const mostUsedTools = Array.from(toolCounts.entries())
    .map(([key, count]) => ({
      toolName: key.split(':')[1],
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Recent errors
  const recentErrors = history
    .filter(e => e.status === 'error')
    .slice(0, 10)

  // Executions by day (last 30 days)
  const executionsByDay: Array<{ date: string; count: number }> = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = history.filter(e => {
      const execDate = new Date(e.startTime)
      execDate.setHours(0, 0, 0, 0)
      return execDate.toISOString().split('T')[0] === dateStr
    }).length

    executionsByDay.push({ date: dateStr, count })
  }

  // Executions by tool
  const executionsByTool = Array.from(toolCounts.entries())
    .map(([key, count]) => ({
      toolName: key.split(':')[1],
      count
    }))
    .sort((a, b) => b.count - a.count)

  return {
    totalExecutions,
    successCount,
    errorCount,
    averageDuration,
    mostUsedTools,
    recentErrors,
    executionsByDay,
    executionsByTool
  }
}

/**
 * Re-run execution
 */
export function rerunExecution(executionId: string): ExecutionRecord {
  const execution = getExecution(executionId)

  if (!execution) {
    throw new Error('Execution not found')
  }

  // Create new execution with same input
  return startExecution(
    execution.serverId,
    execution.serverName,
    execution.toolName,
    execution.input,
    {
      toolDescription: execution.toolDescription,
      chatId: execution.chatId,
      messageId: execution.messageId,
      userId: execution.userId,
      tags: [...execution.tags, 're-run'],
      parentExecutionId: execution.id
    }
  )
}

/**
 * Export executions to JSON
 */
export function exportExecutions(
  filter?: ExecutionFilter
): string {
  const executions = filter
    ? filterExecutions(filter)
    : loadExecutionHistory()

  return JSON.stringify(executions, null, 2)
}

/**
 * Export executions to CSV
 */
export function exportExecutionsCSV(
  filter?: ExecutionFilter
): string {
  const executions = filter
    ? filterExecutions(filter)
    : loadExecutionHistory()

  const headers = [
    'ID',
    'Server',
    'Tool',
    'Status',
    'Start Time',
    'End Time',
    'Duration (ms)',
    'Error'
  ]

  const rows = executions.map(e => [
    e.id,
    e.serverName,
    e.toolName,
    e.status,
    e.startTime,
    e.endTime || '',
    e.duration?.toString() || '',
    e.error || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csv
}

/**
 * Import executions from JSON
 */
export function importExecutions(jsonData: string): number {
  try {
    const imported = JSON.parse(jsonData)

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array')
    }

    // Validate structure
    for (const item of imported) {
      if (!item.id || !item.serverId || !item.toolName || !item.startTime) {
        throw new Error('Invalid execution record format')
      }
    }

    const history = loadExecutionHistory()
    const existingIds = new Set(history.map(e => e.id))

    // Filter out duplicates
    const newExecutions = imported.filter(e => !existingIds.has(e.id))

    if (newExecutions.length === 0) {
      return 0
    }

    // Merge and save
    const merged = [...newExecutions, ...history].slice(0, MAX_HISTORY)
    saveExecutionHistory(merged)

    return newExecutions.length
  } catch (error) {
    throw new Error('Failed to import executions: ' + (error as Error).message)
  }
}

/**
 * Clear execution history
 */
export function clearExecutionHistory(
  filter?: ExecutionFilter
): number {
  if (!filter) {
    // Clear all
    const count = loadExecutionHistory().length
    saveExecutionHistory([])
    return count
  }

  // Clear filtered
  const history = loadExecutionHistory()
  const toDelete = filterExecutions(filter)
  const toKeep = history.filter(e => !toDelete.some(d => d.id === e.id))

  saveExecutionHistory(toKeep)
  return toDelete.length
}

/**
 * Get execution duration formatted
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }

  const seconds = milliseconds / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Get execution status color
 */
export function getStatusColor(status: ExecutionRecord['status']): string {
  switch (status) {
    case 'success':
      return 'green'
    case 'error':
      return 'red'
    case 'pending':
      return 'yellow'
    case 'cancelled':
      return 'gray'
    default:
      return 'gray'
  }
}

/**
 * Analyze execution patterns
 */
export function analyzeExecutionPatterns(): {
  peakHours: Array<{ hour: number; count: number }>
  averageExecutionsPerDay: number
  successRate: number
  commonErrors: Array<{ error: string; count: number }>
} {
  const history = loadExecutionHistory()

  // Peak hours
  const hourCounts = new Map<number, number>()
  for (const execution of history) {
    const hour = new Date(execution.startTime).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  }

  const peakHours = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Average per day
  const oldestExecution = history[history.length - 1]
  const daysSinceFirst = oldestExecution
    ? (Date.now() - new Date(oldestExecution.startTime).getTime()) / (1000 * 60 * 60 * 24)
    : 1

  const averageExecutionsPerDay = history.length / daysSinceFirst

  // Success rate
  const completed = history.filter(e => e.status === 'success' || e.status === 'error')
  const successRate = completed.length > 0
    ? (history.filter(e => e.status === 'success').length / completed.length) * 100
    : 0

  // Common errors
  const errorCounts = new Map<string, number>()
  for (const execution of history) {
    if (execution.error) {
      errorCounts.set(execution.error, (errorCounts.get(execution.error) || 0) + 1)
    }
  }

  const commonErrors = Array.from(errorCounts.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    peakHours,
    averageExecutionsPerDay,
    successRate,
    commonErrors
  }
}
