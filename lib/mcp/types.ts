/**
 * MCP (Model Context Protocol) Type Definitions
 * 
 * Type definitions for MCP servers, clients, and tools
 */

/**
 * MCP Transport types
 */
export type MCPTransportType = 'stdio' | 'sse' | 'websocket'

/**
 * MCP Server transport configuration
 */
export interface MCPTransportConfig {
  type: MCPTransportType
  /** Command for stdio transport */
  command?: string
  /** Arguments for stdio transport */
  args?: string[]
  /** Environment variables for stdio transport */
  env?: Record<string, string>
  /** URL for SSE/WebSocket transport */
  url?: string
}

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  /** Unique identifier for the MCP server */
  id: string
  /** Human-readable name */
  name: string
  /** Description of what this MCP server provides */
  description: string
  /** Transport configuration */
  transport: MCPTransportConfig
  /** Whether the server is enabled */
  enabled: boolean
  /** Tags for categorization */
  tags?: string[]
  /** Version of the MCP server */
  version?: string
  /** Icon or image URL */
  icon?: string
  /** Creator/author information */
  author?: string
  /** When this server was registered */
  registeredAt?: Date
  /** Last time this server was used */
  lastUsedAt?: Date
}

/**
 * MCP Tool metadata
 */
export interface MCPToolMetadata {
  /** Tool name */
  name: string
  /** Tool description */
  description: string
  /** Input schema */
  inputSchema: any
  /** Which MCP server provides this tool */
  serverId: string
}

/**
 * MCP Client state
 */
export interface MCPClientState {
  /** Whether the client is connected */
  connected: boolean
  /** Connection error if any */
  error?: string
  /** Available tools from this client */
  tools: MCPToolMetadata[]
  /** Server configuration */
  server: MCPServerConfig
}

/**
 * MCP Registry entry
 */
export interface MCPRegistryEntry {
  /** Server configuration */
  server: MCPServerConfig
  /** Client state */
  state: MCPClientState
  /** Cleanup function */
  close: () => Promise<void>
}

/**
 * MCP Tool execution result
 */
export interface MCPToolResult {
  /** Whether execution was successful */
  success: boolean
  /** Result data */
  data?: any
  /** Error message if failed */
  error?: string
  /** Execution time in ms */
  executionTime?: number
}

/**
 * MCP Server status
 */
export type MCPServerStatus = 'connected' | 'disconnected' | 'error' | 'connecting'

/**
 * MCP Configuration
 */
export interface MCPConfig {
  /** Maximum number of concurrent MCP clients */
  maxClients?: number
  /** Default timeout for MCP operations (ms) */
  timeout?: number
  /** Whether to auto-reconnect on disconnection */
  autoReconnect?: boolean
  /** Retry attempts for failed connections */
  retryAttempts?: number
  /** Delay between retry attempts (ms) */
  retryDelay?: number
}

/**
 * MCP Error types
 */
export type MCPErrorType = 
  | 'connection_failed'
  | 'transport_error'
  | 'tool_execution_failed'
  | 'invalid_config'
  | 'timeout'
  | 'unknown'

/**
 * MCP Error
 */
export interface MCPError {
  type: MCPErrorType
  message: string
  serverId?: string
  toolName?: string
  originalError?: unknown
}
