/**
 * Toggle MCP Server API
 * 
 * POST /api/mcp/[serverId]/toggle - Enable/disable an MCP server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMCPRegistry, getMCPConfig, loadMCPConfigFromEnv } from '@/lib/mcp'

type Params = {
  params: {
    serverId: string
  }
}

/**
 * POST /api/mcp/[serverId]/toggle
 * Toggle server enabled/disabled state
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { serverId } = params
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'enabled field must be a boolean',
        },
        { status: 400 }
      )
    }

    // Get registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Toggle server
    if (enabled) {
      await registry.enableServer(serverId)
    } else {
      await registry.disableServer(serverId)
    }

    // Get updated state
    const server = registry.getServer(serverId)
    const state = registry.getServerState(serverId)

    return NextResponse.json({
      success: true,
      data: {
        server,
        state,
      },
    })
  } catch (error) {
    console.error('Error toggling MCP server:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle MCP server',
      },
      { status: 500 }
    )
  }
}
