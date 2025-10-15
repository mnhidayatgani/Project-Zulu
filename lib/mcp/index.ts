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

export {
  loadMCPToolsFromWebSocket,
  createMCPClientFromWebSocket,
  isWebSocketAvailable,
  getWebSocketStatusMessage,
  validateWebSocketURL,
} from './load-mcp-from-websocket'

// WebSocket Client
export {
  WebSocketMCPClient,
  createWebSocketClient,
  type WebSocketConnectionState,
  type WebSocketClientOptions,
} from './websocket-client'

// Connection Manager
export {
  WebSocketConnectionManager,
  getConnectionManager,
  type ManagedConnection,
  type ConnectionManagerEvent,
  type UseConnectionManagerReturn,
} from './connection-manager'

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

// Discovery
export {
  discoverServers,
  getServerCategories,
  getPopularServers,
  getRecentServers,
  getRecommendedServers,
  searchServers,
  PUBLIC_SERVER_REGISTRY,
  type DiscoverableServer,
  type DiscoveryFilters,
} from './discovery'

// Favorites
export {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  toggleFavorite,
  sortFavorites,
  searchFavorites,
  exportFavorites,
  importFavorites,
  type FavoriteTool,
  type FavoriteCollection,
  type FavoriteSortBy,
} from './favorites'

// Search
export {
  searchToolsAdvanced,
  saveSearch,
  getSavedSearches,
  getSearchHistory,
  applySavedSearch,
  type SearchFilters,
  type SavedSearch,
} from './search'

// Execution History
export {
  recordExecution,
  getExecutionHistory,
  getStatistics,
  exportToJSON,
  exportToCSV,
  rerunExecution,
  type ToolExecution,
  type ExecutionStatistics,
} from './execution-history'

// Execution Tracking
export {
  trackToolExecution,
  createTrackedTool,
  batchTrackExecutions,
} from './track-execution'

// Supabase Sync
export {
  // Master sync
  setupMCPSync,
  syncAllFromDB,
  syncAllToDB,
  forceSyncNow,
  getSyncStatus,
  getLastSyncTime,
  isSyncAvailable,
  migrateToSupabase,
  clearAllSyncData,
  type SyncStatus,
  type SyncDirection,
} from './sync'

export {
  // Favorites sync
  syncFavoritesFromDB,
  syncFavoritesToDB,
  addFavoriteWithSync,
  removeFavoriteWithSync,
  updateFavoriteWithSync,
  incrementUseCountWithSync,
  setupFavoritesSync,
} from './favorites-sync'

export {
  // Execution history sync
  syncExecutionHistoryFromDB,
  syncExecutionHistoryToDB,
  recordExecutionWithSync,
  clearExecutionHistoryWithSync,
  setupExecutionHistorySync,
  batchSyncExecutions,
} from './execution-history-sync'

export {
  // Search sync
  syncSavedSearchesFromDB,
  syncSavedSearchesToDB,
  saveSearchWithSync,
  deleteSavedSearchWithSync,
  syncSearchHistoryFromDB,
  recordSearchWithSync,
  setupSearchesSync,
  clearSearchHistoryWithSync,
} from './search-sync'

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
