/**
 * WebSocket Connection Manager
 * 
 * Manages multiple WebSocket MCP client connections
 * Provides centralized connection state and lifecycle management
 */

import { WebSocketMCPClient, WebSocketConnectionState, createWebSocketClient } from './websocket-client'
import type { MCPServerConfig } from './types'

/**
 * Connection info with client and metadata
 */
export interface ManagedConnection {
  serverId: string
  client: WebSocketMCPClient
  config: MCPServerConfig
  state: WebSocketConnectionState
  createdAt: Date
  lastActivityAt: Date
}

/**
 * Connection manager events
 */
export type ConnectionManagerEvent = 
  | { type: 'connected'; serverId: string }
  | { type: 'disconnected'; serverId: string }
  | { type: 'error'; serverId: string; error: Error }
  | { type: 'stateChanged'; serverId: string; state: WebSocketConnectionState }

/**
 * WebSocket Connection Manager
 * 
 * Singleton class to manage all WebSocket MCP connections
 */
export class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager | null = null
  
  private connections = new Map<string, ManagedConnection>()
  private eventListeners: Array<(event: ConnectionManagerEvent) => void> = []
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager()
    }
    return WebSocketConnectionManager.instance
  }
  
  /**
   * Connect to a server
   */
  async connect(config: MCPServerConfig): Promise<WebSocketMCPClient> {
    // Check if already connected
    const existing = this.connections.get(config.id)
    if (existing && existing.client.isConnected()) {
      return existing.client
    }
    
    // Create new client
    const client = createWebSocketClient(config)
    
    // Setup state change listener
    client.on('stateChange', (state) => {
      const connection = this.connections.get(config.id)
      if (connection) {
        connection.state = state
        connection.lastActivityAt = new Date()
        
        this.emit({
          type: 'stateChanged',
          serverId: config.id,
          state,
        })
        
        if (state.status === 'connected') {
          this.emit({ type: 'connected', serverId: config.id })
        } else if (state.status === 'disconnected') {
          this.emit({ type: 'disconnected', serverId: config.id })
        } else if (state.status === 'error') {
          this.emit({
            type: 'error',
            serverId: config.id,
            error: new Error(state.error),
          })
        }
      }
    })
    
    // Setup error listener
    client.on('error', (error) => {
      this.emit({
        type: 'error',
        serverId: config.id,
        error,
      })
    })
    
    // Store connection
    const connection: ManagedConnection = {
      serverId: config.id,
      client,
      config,
      state: client.getState(),
      createdAt: new Date(),
      lastActivityAt: new Date(),
    }
    this.connections.set(config.id, connection)
    
    // Connect
    try {
      await client.connect()
      return client
    } catch (error) {
      this.connections.delete(config.id)
      throw error
    }
  }
  
  /**
   * Disconnect from a server
   */
  async disconnect(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId)
    if (connection) {
      await connection.client.disconnect()
      this.connections.delete(serverId)
    }
  }
  
  /**
   * Disconnect all servers
   */
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.connections.keys()).map((id) =>
      this.disconnect(id)
    )
    await Promise.all(promises)
  }
  
  /**
   * Get a connection by server ID
   */
  getConnection(serverId: string): ManagedConnection | undefined {
    return this.connections.get(serverId)
  }
  
  /**
   * Get all connections
   */
  getAllConnections(): ManagedConnection[] {
    return Array.from(this.connections.values())
  }
  
  /**
   * Get connected servers
   */
  getConnectedServers(): ManagedConnection[] {
    return this.getAllConnections().filter((conn) =>
      conn.client.isConnected()
    )
  }
  
  /**
   * Check if a server is connected
   */
  isConnected(serverId: string): boolean {
    const connection = this.connections.get(serverId)
    return connection?.client.isConnected() ?? false
  }
  
  /**
   * Get connection state for a server
   */
  getConnectionState(serverId: string): WebSocketConnectionState | undefined {
    return this.connections.get(serverId)?.state
  }
  
  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size
  }
  
  /**
   * Get connected count
   */
  getConnectedCount(): number {
    return this.getConnectedServers().length
  }
  
  /**
   * Subscribe to connection events
   */
  on(listener: (event: ConnectionManagerEvent) => void): () => void {
    this.eventListeners.push(listener)
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }
  
  /**
   * Emit an event to all listeners
   */
  private emit(event: ConnectionManagerEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in connection manager event listener:', error)
      }
    })
  }
  
  /**
   * Cleanup idle connections
   * @param maxIdleTime Maximum idle time in ms before disconnecting
   */
  async cleanupIdleConnections(maxIdleTime: number = 600000): Promise<void> {
    const now = new Date().getTime()
    const toDisconnect: string[] = []
    
    this.connections.forEach((connection, serverId) => {
      const idleTime = now - connection.lastActivityAt.getTime()
      if (idleTime > maxIdleTime && !connection.client.isConnected()) {
        toDisconnect.push(serverId)
      }
    })
    
    for (const serverId of toDisconnect) {
      await this.disconnect(serverId)
    }
  }
  
  /**
   * Get connection statistics
   */
  getStatistics(): {
    total: number
    connected: number
    disconnected: number
    reconnecting: number
    error: number
  } {
    const connections = this.getAllConnections()
    
    return {
      total: connections.length,
      connected: connections.filter((c) => c.state.status === 'connected').length,
      disconnected: connections.filter((c) => c.state.status === 'disconnected').length,
      reconnecting: connections.filter((c) => c.state.status === 'reconnecting').length,
      error: connections.filter((c) => c.state.status === 'error').length,
    }
  }
}

/**
 * Get the global connection manager instance
 */
export function getConnectionManager(): WebSocketConnectionManager {
  return WebSocketConnectionManager.getInstance()
}

/**
 * React hook helper types (for future React integration)
 */
export type UseConnectionManagerReturn = {
  manager: WebSocketConnectionManager
  connections: ManagedConnection[]
  statistics: ReturnType<WebSocketConnectionManager['getStatistics']>
  connect: (config: MCPServerConfig) => Promise<WebSocketMCPClient>
  disconnect: (serverId: string) => Promise<void>
  isConnected: (serverId: string) => boolean
}
