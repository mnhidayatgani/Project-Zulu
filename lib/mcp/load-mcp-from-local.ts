/**
 * Load MCP Tools from Local Command
 * 
 * Legacy function for loading MCP tools from a local stdio command
 * For new code, use EnhancedMCPClient or MCPRegistry instead
 */

import { experimental_createMCPClient as createMCPClient } from "ai"
// @ts-ignore - mcp-stdio module resolution issue with bundler
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio"
import type { MCPServerConfig } from "./types"
import { createEnhancedMCPClient } from "./client"

/**
 * @deprecated Use createEnhancedMCPClient with MCPServerConfig instead
 */
export async function loadMCPToolsFromLocal(
  command: string,
  env: Record<string, string> = {}
) {
  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command,
      args: ["stdio"],
      env,
    }),
  })

  const tools = await mcpClient.tools()
  return { tools, close: () => mcpClient.close() }
}

/**
 * Create MCP client from local command (new API)
 */
export async function createMCPClientFromLocal(
  command: string,
  args: string[] = ["stdio"],
  env: Record<string, string> = {},
  serverConfig?: Partial<MCPServerConfig>
) {
  const config: MCPServerConfig = {
    id: serverConfig?.id || `local-${Date.now()}`,
    name: serverConfig?.name || command,
    description: serverConfig?.description || `Local MCP server: ${command}`,
    transport: {
      type: 'stdio',
      command,
      args,
      env,
    },
    enabled: true,
    ...serverConfig,
  }

  return createEnhancedMCPClient(config)
}
