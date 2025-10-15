/**
 * WebSocket MCP Client
 * 
 * Full implementation of MCP client over WebSocket transport
 * with auto-reconnection, heartbeat, and message queueing
 */

import type { MCPServerConfig, MCPToolMetadata } from './types'
import { MCPConnectionError, MCPTimeoutError } from './errors'

/**
 * WebSocket connection state
 */
export interface WebSocketConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  error?: string
  reconnectAttempts: number
  lastConnectedAt?: Date
  lastDisconnectedAt?: Date
}

/**
 * WebSocket message types (JSON-RPC 2.0)
 */
interface JSONRPCRequest {
  jsonrpc: '2.0'
  method: string
  params?: any
  id: number | string
}

interface JSONRPCResponse {
  jsonrpc: '2.0'
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
  id: number | string
}

interface JSONRPCNotification {
  jsonrpc: '2.0'
  method: string
  params?: any
}

/**
 * WebSocket MCP Client options
 */
export interface WebSocketClientOptions {
  /** Connection timeout in ms */
  connectionTimeout?: number
  /** Enable auto-reconnect */
  reconnect?: boolean
  /** Initial reconnect delay in ms */
  reconnectDelay?: number
  /** Maximum reconnect delay in ms */
  maxReconnectDelay?: number
  /** Maximum reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number
  /** Heartbeat interval in ms (0 = disabled) */
  heartbeatInterval?: number
  /** Heartbeat timeout in ms */
  heartbeatTimeout?: number
  /** Message queue size limit */
  messageQueueLimit?: number
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<WebSocketClientOptions> = {
  connectionTimeout: 30000,
  reconnect: true,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  maxReconnectAttempts: 0, // infinite
  heartbeatInterval: 30000,
  heartbeatTimeout: 5000,
  messageQueueLimit: 100,
}

/**
 * WebSocket MCP Client
 */
export class WebSocketMCPClient {
  private socket: WebSocket | null = null
  private config: MCPServerConfig
  private options: Required<WebSocketClientOptions>
  
  private connectionState: WebSocketConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0,
  }
  
  private messageQueue: JSONRPCRequest[] = []
  private pendingRequests = new Map<number | string, {
    resolve: (value: any) => void
    reject: (error: any) => void
    timeout: NodeJS.Timeout
  }>()
  
  private messageId = 0
  private heartbeatInterval: NodeJS.Timeout | null = null
  private heartbeatTimeout: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  
  private eventListeners: {
    onStateChange?: (state: WebSocketConnectionState) => void
    onMessage?: (message: any) => void
    onError?: (error: Error) => void
  } = {}

  constructor(config: MCPServerConfig, options: Partial<WebSocketClientOptions> = {}) {
    this.config = config
    this.options = { ...DEFAULT_OPTIONS, ...options, ...config.transport.websocket }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      return // Already connecting
    }

    const url = this.config.transport.url
    if (!url) {
      throw new MCPConnectionError('WebSocket URL is required', this.config.id)
    }

    this.updateState({ status: 'connecting' })

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.socket?.close()
        const error = new MCPTimeoutError(
          `Connection timeout after ${this.options.connectionTimeout}ms`,
          this.config.id
        )
        this.updateState({ status: 'error', error: error.message })
        reject(error)
      }, this.options.connectionTimeout)

      try {
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
          clearTimeout(timeout)
          this.updateState({
            status: 'connected',
            reconnectAttempts: 0,
            lastConnectedAt: new Date(),
          })
          this.startHeartbeat()
          this.flushMessageQueue()
          resolve()
        }

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.socket.onerror = (event) => {
          clearTimeout(timeout)
          const error = new MCPConnectionError(
            'WebSocket connection error',
            this.config.id
          )
          this.updateState({ status: 'error', error: error.message })
          this.eventListeners.onError?.(error)
          reject(error)
        }

        this.socket.onclose = () => {
          clearTimeout(timeout)
          this.stopHeartbeat()
          this.updateState({
            status: 'disconnected',
            lastDisconnectedAt: new Date(),
          })
          
          // Auto-reconnect if enabled
          if (this.options.reconnect) {
            this.scheduleReconnect()
          }
        }
      } catch (error) {
        clearTimeout(timeout)
        this.updateState({ status: 'error', error: (error as Error).message })
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    this.options.reconnect = false // Disable auto-reconnect
    this.stopHeartbeat()
    this.clearReconnectTimeout()
    
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    
    this.updateState({ status: 'disconnected' })
  }

  /**
   * Send a JSON-RPC request
   */
  async sendRequest(method: string, params?: any, timeout?: number): Promise<any> {
    const id = ++this.messageId
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    }

    return new Promise((resolve, reject) => {
      const requestTimeout = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new MCPTimeoutError(
          `Request timeout for ${method}`,
          this.config.id
        ))
      }, timeout || this.options.connectionTimeout)

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: requestTimeout,
      })

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(request))
      } else {
        // Queue message if not connected
        if (this.messageQueue.length < this.options.messageQueueLimit) {
          this.messageQueue.push(request)
        } else {
          clearTimeout(requestTimeout)
          this.pendingRequests.delete(id)
          reject(new MCPConnectionError(
            'Message queue full',
            this.config.id
          ))
        }
      }
    })
  }

  /**
   * Send a notification (no response expected)
   */
  sendNotification(method: string, params?: any): void {
    const notification: JSONRPCNotification = {
      jsonrpc: '2.0',
      method,
      params,
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(notification))
    }
  }

  /**
   * Get available tools from MCP server
   */
  async getTools(): Promise<MCPToolMetadata[]> {
    const response = await this.sendRequest('tools/list')
    
    if (response.tools && Array.isArray(response.tools)) {
      return response.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema || {},
        serverId: this.config.id,
      }))
    }
    
    return []
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    return this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    })
  }

  /**
   * Get connection state
   */
  getState(): WebSocketConnectionState {
    return { ...this.connectionState }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Set event listeners
   */
  on(event: 'stateChange', listener: (state: WebSocketConnectionState) => void): void
  on(event: 'message', listener: (message: any) => void): void
  on(event: 'error', listener: (error: Error) => void): void
  on(event: string, listener: any): void {
    if (event === 'stateChange') {
      this.eventListeners.onStateChange = listener
    } else if (event === 'message') {
      this.eventListeners.onMessage = listener
    } else if (event === 'error') {
      this.eventListeners.onError = listener
    }
  }

  // ==================== Private Methods ====================

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      
      // Handle JSON-RPC response
      if ('id' in message && this.pendingRequests.has(message.id)) {
        const pending = this.pendingRequests.get(message.id)!
        this.pendingRequests.delete(message.id)
        clearTimeout(pending.timeout)
        
        if (message.error) {
          pending.reject(new MCPConnectionError(
            message.error.message,
            this.config.id
          ))
        } else {
          pending.resolve(message.result)
        }
      }
      // Handle notification or event
      else if ('method' in message) {
        this.eventListeners.onMessage?.(message)
      }
      
      // Reset heartbeat timeout
      this.resetHeartbeatTimeout()
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Update connection state
   */
  private updateState(partial: Partial<WebSocketConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...partial }
    this.eventListeners.onStateChange?.(this.connectionState)
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendNotification('ping')
        this.scheduleHeartbeatTimeout()
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * Schedule heartbeat timeout check
   */
  private scheduleHeartbeatTimeout(): void {
    this.heartbeatTimeout = setTimeout(() => {
      // No pong received, connection might be dead
      console.warn('Heartbeat timeout - reconnecting')
      this.socket?.close()
    }, this.options.heartbeatTimeout)
  }

  /**
   * Reset heartbeat timeout (message received)
   */
  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    const attempts = this.connectionState.reconnectAttempts
    
    if (
      this.options.maxReconnectAttempts > 0 &&
      attempts >= this.options.maxReconnectAttempts
    ) {
      this.updateState({
        status: 'error',
        error: 'Max reconnection attempts reached',
      })
      return
    }

    // Exponential backoff
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, attempts),
      this.options.maxReconnectDelay
    )

    this.updateState({
      status: 'reconnecting',
      reconnectAttempts: attempts + 1,
    })

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!
      this.socket.send(JSON.stringify(message))
    }
  }
}

/**
 * Create a WebSocket MCP client
 */
export function createWebSocketClient(
  config: MCPServerConfig,
  options?: Partial<WebSocketClientOptions>
): WebSocketMCPClient {
  return new WebSocketMCPClient(config, options)
}
