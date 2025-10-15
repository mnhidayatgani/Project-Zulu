/**
 * MCP Error Handling
 * 
 * Custom error classes and error handling utilities for MCP operations
 */

import { MCPErrorType } from './types'

/**
 * Base MCP Error class
 */
export class MCPError extends Error {
  public readonly type: MCPErrorType
  public readonly serverId?: string
  public readonly toolName?: string
  public readonly originalError?: unknown

  constructor(
    type: MCPErrorType,
    message: string,
    options?: {
      serverId?: string
      toolName?: string
      originalError?: unknown
    }
  ) {
    super(message)
    this.name = 'MCPError'
    this.type = type
    this.serverId = options?.serverId
    this.toolName = options?.toolName
    this.originalError = options?.originalError

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPError)
    }
  }

  /**
   * Convert error to JSON
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      serverId: this.serverId,
      toolName: this.toolName,
      stack: this.stack,
    }
  }
}

/**
 * Connection failed error
 */
export class MCPConnectionError extends MCPError {
  constructor(message: string, serverId?: string, originalError?: unknown) {
    super('connection_failed', message, { serverId, originalError })
    this.name = 'MCPConnectionError'
  }
}

/**
 * Transport error
 */
export class MCPTransportError extends MCPError {
  constructor(message: string, serverId?: string, originalError?: unknown) {
    super('transport_error', message, { serverId, originalError })
    this.name = 'MCPTransportError'
  }
}

/**
 * Tool execution failed error
 */
export class MCPToolExecutionError extends MCPError {
  constructor(
    message: string,
    toolName: string,
    serverId?: string,
    originalError?: unknown
  ) {
    super('tool_execution_failed', message, { serverId, toolName, originalError })
    this.name = 'MCPToolExecutionError'
  }
}

/**
 * Invalid configuration error
 */
export class MCPConfigError extends MCPError {
  constructor(message: string, serverId?: string) {
    super('invalid_config', message, { serverId })
    this.name = 'MCPConfigError'
  }
}

/**
 * Timeout error
 */
export class MCPTimeoutError extends MCPError {
  constructor(message: string, serverId?: string, toolName?: string) {
    super('timeout', message, { serverId, toolName })
    this.name = 'MCPTimeoutError'
  }
}

/**
 * Check if error is an MCP error
 */
export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError
}

/**
 * Format error for logging
 */
export function formatMCPError(error: unknown): string {
  if (isMCPError(error)) {
    const parts = [
      `[${error.type}]`,
      error.message,
    ]

    if (error.serverId) {
      parts.push(`(server: ${error.serverId})`)
    }

    if (error.toolName) {
      parts.push(`(tool: ${error.toolName})`)
    }

    return parts.join(' ')
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

/**
 * Wrap an error as MCPError if it isn't already
 */
export function wrapError(
  error: unknown,
  type: MCPErrorType = 'unknown',
  serverId?: string,
  toolName?: string
): MCPError {
  if (isMCPError(error)) {
    return error
  }

  const message = error instanceof Error ? error.message : String(error)
  
  return new MCPError(type, message, {
    serverId,
    toolName,
    originalError: error,
  })
}
