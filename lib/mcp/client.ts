/**
 * Enhanced MCP Client Wrapper
 * 
 * Provides a robust wrapper around the AI SDK's MCP client with:
 * - Error handling
 * - Retry logic
 * - Connection management
 * - Tool execution
 */

import { experimental_createMCPClient as createMCPClient } from 'ai'
// @ts-ignore - mcp-stdio module resolution issue with bundler
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio'
import type { MCPServerConfig, MCPClientState, MCPToolResult, MCPConfig } from './types'
import {
  MCPConnectionError,
  MCPTransportError,
  MCPToolExecutionError,
  MCPTimeoutError,
  wrapError,
} from './errors'
import { getMCPConfig } from './config'

/**
 * Enhanced MCP Client
 */
export class EnhancedMCPClient {
  private client: any = null
  private serverConfig: MCPServerConfig
  private config: Required<MCPConfig>
  private connectionAttempts = 0
  private isConnecting = false

  constructor(serverConfig: MCPServerConfig, config?: Partial<MCPConfig>) {
    this.serverConfig = serverConfig
    this.config = getMCPConfig(config)
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.isConnecting) {
      throw new MCPConnectionError(
        'Connection already in progress',
        this.serverConfig.id
      )
    }

    if (this.client) {
      return // Already connected
    }

    this.isConnecting = true
    this.connectionAttempts = 0

    try {
      await this.connectWithRetry()
    } finally {
      this.isConnecting = false
    }
  }

  /**
   * Connect with retry logic
   */
  private async connectWithRetry(): Promise<void> {
    let lastError: unknown

    for (let i = 0; i < this.config.retryAttempts; i++) {
      try {
        this.connectionAttempts++
        await this.createClient()
        return // Success
      } catch (error) {
        lastError = error

        if (i < this.config.retryAttempts - 1) {
          // Wait before retrying
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay)
          )
        }
      }
    }

    throw new MCPConnectionError(
      `Failed to connect after ${this.config.retryAttempts} attempts`,
      this.serverConfig.id,
      lastError
    )
  }

  /**
   * Create the underlying MCP client
   */
  private async createClient(): Promise<void> {
    const { transport } = this.serverConfig

    try {
      if (transport.type === 'stdio') {
        if (!transport.command) {
          throw new MCPTransportError(
            'Command is required for stdio transport',
            this.serverConfig.id
          )
        }

        this.client = await createMCPClient({
          transport: new StdioMCPTransport({
            command: transport.command,
            args: transport.args || [],
            env: transport.env || {},
          }),
          name: `zola-mcp-${this.serverConfig.id}`,
        })
      } else if (transport.type === 'sse') {
        if (!transport.url) {
          throw new MCPTransportError(
            'URL is required for SSE transport',
            this.serverConfig.id
          )
        }

        this.client = await createMCPClient({
          transport: {
            type: 'sse',
            url: transport.url,
          },
          name: `zola-mcp-${this.serverConfig.id}`,
        })
      } else {
        throw new MCPTransportError(
          `Unsupported transport type: ${transport.type}`,
          this.serverConfig.id
        )
      }
    } catch (error) {
      throw wrapError(error, 'connection_failed', this.serverConfig.id)
    }
  }

  /**
   * Get available tools from the MCP server
   */
  async getTools(): Promise<any> {
    if (!this.client) {
      throw new MCPConnectionError(
        'Client not connected',
        this.serverConfig.id
      )
    }

    try {
      return await this.withTimeout(
        this.client.tools(),
        this.config.timeout,
        'Get tools'
      )
    } catch (error) {
      throw wrapError(error, 'unknown', this.serverConfig.id)
    }
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolName: string,
    args: any
  ): Promise<MCPToolResult> {
    if (!this.client) {
      throw new MCPConnectionError(
        'Client not connected',
        this.serverConfig.id
      )
    }

    const startTime = Date.now()

    try {
      const result = await this.withTimeout(
        this.client.callTool(toolName, args),
        this.config.timeout,
        `Execute tool: ${toolName}`
      )

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: result,
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      throw new MCPToolExecutionError(
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        toolName,
        this.serverConfig.id,
        error
      )
    }
  }

  /**
   * Get client state
   */
  getState(): MCPClientState {
    return {
      connected: this.client !== null,
      error: undefined,
      tools: [], // Will be populated when tools are fetched
      server: this.serverConfig,
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close()
      } catch (error) {
        console.error('Error closing MCP client:', error)
      } finally {
        this.client = null
      }
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.client !== null
  }

  /**
   * Get server configuration
   */
  getServerConfig(): MCPServerConfig {
    return this.serverConfig
  }

  /**
   * Execute operation with timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    operation: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(
            new MCPTimeoutError(
              `${operation} timed out after ${timeout}ms`,
              this.serverConfig.id
            )
          )
        }, timeout)
      }),
    ])
  }
}

/**
 * Create an enhanced MCP client
 */
export async function createEnhancedMCPClient(
  serverConfig: MCPServerConfig,
  config?: Partial<MCPConfig>
): Promise<EnhancedMCPClient> {
  const client = new EnhancedMCPClient(serverConfig, config)
  await client.connect()
  return client
}
