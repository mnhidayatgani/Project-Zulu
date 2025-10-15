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
  /** WebSocket-specific options */
  websocket?: {
    /** Enable auto-reconnect */
    reconnect?: boolean
    /** Reconnect delay in ms */
    reconnectDelay?: number
    /** Maximum reconnection attempts */
    maxReconnectAttempts?: number
    /** Heartbeat interval in ms */
    heartbeatInterval?: number
    /** Connection timeout in ms */
    connectionTimeout?: number
  }
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

/**
 * Tool Category types
 */
export type ToolCategoryType =
  | 'file_operations'
  | 'web_api'
  | 'database'
  | 'system'
  | 'data_processing'
  | 'ai_ml'
  | 'text_documents'
  | 'media_graphics'
  | 'security'
  | 'analytics'
  | 'other'

/**
 * Tool Category definition
 */
export interface ToolCategory {
  id: ToolCategoryType
  name: string
  description: string
  icon: string
  color: string
}

/**
 * Enhanced Tool metadata with category
 */
export interface MCPToolMetadataEnhanced extends MCPToolMetadata {
  /** Tool category */
  category?: ToolCategoryType
  /** Tool usage count */
  usageCount?: number
  /** Last used timestamp */
  lastUsedAt?: Date
  /** Success rate (0-1) */
  successRate?: number
}

/**
 * Tool usage analytics event
 */
export interface ToolUsageEvent {
  /** Tool name */
  toolName: string
  /** Server ID */
  serverId: string
  /** When it was executed */
  timestamp: Date
  /** Execution time in ms */
  executionTime: number
  /** Whether it succeeded */
  success: boolean
  /** Error if failed */
  error?: string
  /** User ID (if authenticated) */
  userId?: string
}

/**
 * Server analytics
 */
export interface ServerAnalytics {
  /** Server ID */
  serverId: string
  /** Total tool executions */
  totalExecutions: number
  /** Successful executions */
  successfulExecutions: number
  /** Failed executions */
  failedExecutions: number
  /** Average execution time in ms */
  avgExecutionTime: number
  /** Uptime percentage */
  uptimePercentage: number
  /** First connected at */
  firstConnectedAt?: Date
  /** Last active at */
  lastActiveAt?: Date
  /** Total connection time in ms */
  totalConnectionTime: number
  /** Connection failures */
  connectionFailures: number
}

/**
 * Tool analytics
 */
export interface ToolAnalytics {
  /** Tool name */
  toolName: string
  /** Server ID */
  serverId: string
  /** Usage count */
  usageCount: number
  /** Success count */
  successCount: number
  /** Failure count */
  failureCount: number
  /** Average execution time */
  avgExecutionTime: number
  /** Success rate (0-1) */
  successRate: number
  /** First used */
  firstUsedAt?: Date
  /** Last used */
  lastUsedAt?: Date
  /** Category */
  category?: ToolCategoryType
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  /** Total servers */
  totalServers: number
  /** Active servers */
  activeServers: number
  /** Total tools */
  totalTools: number
  /** Total executions */
  totalExecutions: number
  /** Overall success rate */
  overallSuccessRate: number
  /** Most popular tools */
  popularTools: ToolAnalytics[]
  /** Server health */
  serverHealth: ServerAnalytics[]
  /** Category distribution */
  categoryDistribution: Record<ToolCategoryType, number>
  /** Time period */
  periodStart: Date
  periodEnd: Date
}

