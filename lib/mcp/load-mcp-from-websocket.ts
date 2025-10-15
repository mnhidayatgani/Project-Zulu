/**
 * WebSocket MCP Client Loader
 * 
 * Load MCP tools from a WebSocket-based MCP server
 * Full implementation with JSON-RPC 2.0 over WebSocket
 */

import type { MCPServerConfig, MCPToolMetadata } from './types'
import { MCPConnectionError } from './errors'
import { WebSocketMCPClient, createWebSocketClient } from './websocket-client'

/**
 * Load MCP tools from a WebSocket server
 * 
 * Connects to a WebSocket MCP server and retrieves available tools
 */
export async function loadMCPToolsFromWebSocket(
  config: MCPServerConfig
): Promise<MCPToolMetadata[]> {
  if (!config.transport.url) {
    throw new MCPConnectionError(
      `WebSocket URL is required for ${config.id}`,
      config.id
    )
  }

  // Validate WebSocket URL
  const url = config.transport.url
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    throw new MCPConnectionError(
      `Invalid WebSocket URL: ${url}. Must start with ws:// or wss://`,
      config.id
    )
  }

  // Create client and connect
  const client = createWebSocketClient(config)
  
  try {
    await client.connect()
    const tools = await client.getTools()
    // Keep connection open for future use
    return tools
  } catch (error) {
    await client.disconnect()
    throw error
  }
}

/**
 * Create a WebSocket MCP client
 * 
 * Returns a client instance that can be reused for multiple operations
 */
export async function createMCPClientFromWebSocket(
  config: MCPServerConfig
): Promise<WebSocketMCPClient> {
  const client = createWebSocketClient(config)
  await client.connect()
  return client
}

/**
 * Check if WebSocket transport is available
 */
export function isWebSocketAvailable(): boolean {
  return typeof WebSocket !== 'undefined'
}

/**
 * Get WebSocket connection status message
 */
export function getWebSocketStatusMessage(): string {
  if (typeof WebSocket === 'undefined') {
    return 'WebSocket is not available in this environment'
  }
  return 'WebSocket transport is fully functional and ready to connect to MCP servers.'
}

/**
 * Validate WebSocket URL
 */
export function validateWebSocketURL(url: string): {
  valid: boolean
  error?: string
} {
  if (!url) {
    return { valid: false, error: 'URL is required' }
  }
  
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    return { valid: false, error: 'URL must start with ws:// or wss://' }
  }
  
  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

export default {
  loadMCPToolsFromWebSocket,
  createMCPClientFromWebSocket,
  isWebSocketAvailable,
  getWebSocketStatusMessage,
  validateWebSocketURL,
}
