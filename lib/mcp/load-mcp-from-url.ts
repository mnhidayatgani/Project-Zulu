/**
 * Load MCP Tools from URL (SSE)
 * 
 * Legacy function for loading MCP tools from a remote SSE endpoint
 * For new code, use EnhancedMCPClient or MCPRegistry instead
 */

import { experimental_createMCPClient as createMCPClient } from "ai"
import type { MCPServerConfig } from "./types"
import { createEnhancedMCPClient } from "./client"

/**
 * @deprecated Use createEnhancedMCPClient with MCPServerConfig instead
 */
export async function loadMCPToolsFromURL(url: string) {
  const mcpClient = await createMCPClient({
    transport: {
      type: "sse",
      url,
    },
  })

  const tools = await mcpClient.tools()
  return { tools, close: () => mcpClient.close() }
}

/**
 * Create MCP client from URL (new API)
 */
export async function createMCPClientFromURL(
  url: string,
  serverConfig?: Partial<MCPServerConfig>
) {
  const config: MCPServerConfig = {
    id: serverConfig?.id || `remote-${Date.now()}`,
    name: serverConfig?.name || new URL(url).hostname,
    description: serverConfig?.description || `Remote MCP server: ${url}`,
    transport: {
      type: 'sse',
      url,
    },
    enabled: true,
    ...serverConfig,
  }

  return createEnhancedMCPClient(config)
}
