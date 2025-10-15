/**
 * MCP Registry
 * 
 * Manages multiple MCP servers and their clients
 * Provides a centralized way to register, connect, and manage MCP servers
 */

import type { MCPServerConfig, MCPRegistryEntry, MCPConfig, MCPClientState } from './types'
import { EnhancedMCPClient, createEnhancedMCPClient } from './client'
import { MCPConnectionError, MCPConfigError } from './errors'
import { validateMCPServerConfig } from './config'

/**
 * MCP Registry singleton
 */
export class MCPRegistry {
  private static instance: MCPRegistry | null = null
  private servers: Map<string, MCPRegistryEntry> = new Map()
  private config: Required<MCPConfig>

  private constructor(config: Required<MCPConfig>) {
    this.config = config
  }

  /**
   * Get the singleton instance
   */
  static getInstance(config?: Required<MCPConfig>): MCPRegistry {
    if (!MCPRegistry.instance) {
      if (!config) {
        throw new Error('Config is required for first initialization')
      }
      MCPRegistry.instance = new MCPRegistry(config)
    }
    return MCPRegistry.instance
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    MCPRegistry.instance = null
  }

  /**
   * Register a new MCP server
   */
  async register(serverConfig: MCPServerConfig): Promise<void> {
    // Validate configuration
    const validation = validateMCPServerConfig(serverConfig)
    if (!validation.valid) {
      throw new MCPConfigError(
        `Invalid server configuration: ${validation.errors.join(', ')}`,
        serverConfig.id
      )
    }

    // Check if already registered
    if (this.servers.has(serverConfig.id)) {
      throw new MCPConfigError(
        `Server with ID '${serverConfig.id}' is already registered`,
        serverConfig.id
      )
    }

    // Check max clients limit
    if (this.servers.size >= this.config.maxClients) {
      throw new MCPConfigError(
        `Maximum number of MCP clients (${this.config.maxClients}) reached`,
        serverConfig.id
      )
    }

    // Create client but don't connect yet
    const client = new EnhancedMCPClient(serverConfig, this.config)

    // Create registry entry
    const entry: MCPRegistryEntry = {
      server: {
        ...serverConfig,
        registeredAt: new Date(),
      },
      state: {
        connected: false,
        tools: [],
        server: serverConfig,
      },
      close: () => client.close(),
    }

    // Add to registry
    this.servers.set(serverConfig.id, entry)

    // Connect if enabled
    if (serverConfig.enabled) {
      try {
        await this.connect(serverConfig.id)
      } catch (error) {
        // Store error in state but don't throw
        entry.state.error = error instanceof Error ? error.message : String(error)
        console.error(`Failed to connect to MCP server ${serverConfig.id}:`, error)
      }
    }
  }

  /**
   * Unregister an MCP server
   */
  async unregister(serverId: string): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    // Close connection
    await entry.close()

    // Remove from registry
    this.servers.delete(serverId)
  }

  /**
   * Connect to an MCP server
   */
  async connect(serverId: string): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    // Create new client
    const client = await createEnhancedMCPClient(entry.server, this.config)

    // Get tools
    const tools = await client.getTools()

    // Update state
    entry.state = {
      connected: true,
      tools: Object.keys(tools).map(name => ({
        name,
        description: tools[name].description,
        inputSchema: tools[name].parameters,
        serverId,
      })),
      server: entry.server,
      error: undefined,
    }

    // Update close function
    entry.close = () => client.close()

    // Update last used
    entry.server.lastUsedAt = new Date()
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(serverId: string): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    await entry.close()

    // Update state
    entry.state.connected = false
    entry.state.tools = []
  }

  /**
   * Get all registered servers
   */
  getServers(): MCPServerConfig[] {
    return Array.from(this.servers.values()).map(entry => entry.server)
  }

  /**
   * Get server by ID
   */
  getServer(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId)?.server
  }

  /**
   * Get server state
   */
  getServerState(serverId: string): MCPClientState | undefined {
    return this.servers.get(serverId)?.state
  }

  /**
   * Get all connected servers
   */
  getConnectedServers(): MCPServerConfig[] {
    return Array.from(this.servers.values())
      .filter(entry => entry.state.connected)
      .map(entry => entry.server)
  }

  /**
   * Get all available tools from all connected servers
   */
  getAllTools(): Record<string, any> {
    const allTools: Record<string, any> = {}

    for (const entry of Array.from(this.servers.values())) {
      if (entry.state.connected) {
        for (const tool of entry.state.tools) {
          // Prefix tool name with server ID to avoid conflicts
          const toolKey = `${entry.server.id}:${tool.name}`
          allTools[toolKey] = {
            ...tool,
            displayName: tool.name,
            serverId: entry.server.id,
          }
        }
      }
    }

    return allTools
  }

  /**
   * Enable a server
   */
  async enableServer(serverId: string): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    entry.server.enabled = true

    if (!entry.state.connected) {
      await this.connect(serverId)
    }
  }

  /**
   * Disable a server
   */
  async disableServer(serverId: string): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    entry.server.enabled = false

    if (entry.state.connected) {
      await this.disconnect(serverId)
    }
  }

  /**
   * Update server configuration
   */
  async updateServer(
    serverId: string,
    updates: Partial<MCPServerConfig>
  ): Promise<void> {
    const entry = this.servers.get(serverId)
    if (!entry) {
      throw new MCPConfigError(`Server '${serverId}' not found`)
    }

    // Update configuration
    const updatedConfig = {
      ...entry.server,
      ...updates,
      id: serverId, // Don't allow ID changes
    }

    // Validate new configuration
    const validation = validateMCPServerConfig(updatedConfig)
    if (!validation.valid) {
      throw new MCPConfigError(
        `Invalid server configuration: ${validation.errors.join(', ')}`,
        serverId
      )
    }

    // If transport changed and connected, reconnect
    const transportChanged = JSON.stringify(entry.server.transport) !== 
                           JSON.stringify(updates.transport)

    if (transportChanged && entry.state.connected) {
      await this.disconnect(serverId)
    }

    // Update server config
    entry.server = updatedConfig

    // Reconnect if needed
    if (transportChanged && updatedConfig.enabled) {
      await this.connect(serverId)
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.servers.values()).map(entry => 
      entry.close().catch(error => {
        console.error(`Error closing ${entry.server.id}:`, error)
      })
    )

    await Promise.all(closePromises)
    this.servers.clear()
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const servers = Array.from(this.servers.values())
    
    return {
      total: servers.length,
      connected: servers.filter(e => e.state.connected).length,
      disconnected: servers.filter(e => !e.state.connected).length,
      enabled: servers.filter(e => e.server.enabled).length,
      disabled: servers.filter(e => !e.server.enabled).length,
      totalTools: servers.reduce((sum, e) => sum + e.state.tools.length, 0),
    }
  }
}

/**
 * Get the global MCP registry instance
 */
export function getMCPRegistry(config?: Required<MCPConfig>): MCPRegistry {
  return MCPRegistry.getInstance(config)
}
