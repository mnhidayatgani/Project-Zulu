/**
 * MCP (Model Context Protocol) Module
 * 
 * This module provides comprehensive support for integrating MCP servers
 * into the Zola AI chat interface.
 * 
 * @module lib/mcp
 */

// Types
export type {
  MCPTransportType,
  MCPTransportConfig,
  MCPServerConfig,
  MCPToolMetadata,
  MCPClientState,
  MCPRegistryEntry,
  MCPToolResult,
  MCPServerStatus,
  MCPConfig,
  MCPErrorType,
  MCPError as MCPErrorInterface,
  ToolCategoryType,
  ToolCategory,
  MCPToolMetadataEnhanced,
  ToolUsageEvent,
  ServerAnalytics,
  ToolAnalytics,
  AnalyticsSummary,
} from './types'

// Errors
export {
  MCPError,
  MCPConnectionError,
  MCPTransportError,
  MCPToolExecutionError,
  MCPConfigError,
  MCPTimeoutError,
  isMCPError,
  formatMCPError,
  wrapError,
} from './errors'

// Configuration
export {
  DEFAULT_MCP_CONFIG,
  EXAMPLE_MCP_SERVERS,
  MCP_ENV_KEYS,
  getMCPConfig,
  validateMCPServerConfig,
  loadMCPConfigFromEnv,
} from './config'

// Client
export {
  EnhancedMCPClient,
  createEnhancedMCPClient,
} from './client'

// Registry
export {
  MCPRegistry,
  getMCPRegistry,
} from './registry'

// Loaders (legacy and new)
export {
  loadMCPToolsFromLocal,
  createMCPClientFromLocal,
} from './load-mcp-from-local'

export {
  loadMCPToolsFromURL,
  createMCPClientFromURL,
} from './load-mcp-from-url'

// Categories
export {
  TOOL_CATEGORIES,
  getCategoryById,
  getCategoryByName,
  categorizeTool,
  categorizeTools,
  getCategoryDistribution,
  filterToolsByCategory,
  searchTools,
  getPopularCategories,
} from './categories'

// Analytics
export {
  trackToolExecution,
  trackServerConnection,
  getToolAnalytics,
  getServerAnalytics,
  getAnalyticsSummary,
  getPopularTools,
  getToolSuccessRate,
  exportAnalytics,
  clearAnalytics,
  getAnalyticsForPeriod,
  analyticsStore,
} from './analytics'

/**
 * Quick start guide for using MCP in Zola
 * 
 * @example
 * ```typescript
 * // 1. Initialize the registry
 * import { getMCPRegistry, EXAMPLE_MCP_SERVERS } from '@/lib/mcp'
 * 
 * const registry = getMCPRegistry()
 * 
 * // 2. Register a server
 * await registry.register(EXAMPLE_MCP_SERVERS[0])
 * 
 * // 3. Get all available tools
 * const tools = registry.getAllTools()
 * 
 * // 4. Use tools in chat API
 * // See app/api/chat/route.ts for integration
 * ```
 * 
 * @example
 * ```typescript
 * // Create a custom MCP server
 * import { createEnhancedMCPClient } from '@/lib/mcp'
 * 
 * const client = await createEnhancedMCPClient({
 *   id: 'my-custom-mcp',
 *   name: 'My Custom MCP',
 *   description: 'Custom tools for my app',
 *   transport: {
 *     type: 'stdio',
 *     command: 'node',
 *     args: ['./my-mcp-server.js'],
 *   },
 *   enabled: true,
 * })
 * 
 * const tools = await client.getTools()
 * ```
 */
