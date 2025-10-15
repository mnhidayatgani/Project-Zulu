/**
 * Register New MCP Server API
 * 
 * POST /api/mcp/register - Register a new MCP server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMCPRegistry, getMCPConfig, loadMCPConfigFromEnv, validateMCPServerConfig } from '@/lib/mcp'
import type { MCPServerConfig } from '@/lib/mcp'

/**
 * POST /api/mcp/register
 * Register a new MCP server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const serverConfig = body as Partial<MCPServerConfig>

    // Validate configuration
    const validation = validateMCPServerConfig(serverConfig)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid server configuration',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Get registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Register the server
    await registry.register(serverConfig as MCPServerConfig)

    // Get the registered server state
    const state = registry.getServerState(serverConfig.id!)

    return NextResponse.json({
      success: true,
      data: {
        server: serverConfig,
        state,
      },
    })
  } catch (error) {
    console.error('Error registering MCP server:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register MCP server',
      },
      { status: 500 }
    )
  }
}
