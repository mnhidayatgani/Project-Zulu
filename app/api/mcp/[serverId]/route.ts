/**
 * Individual MCP Server Management API
 * 
 * GET /api/mcp/[serverId] - Get server details
 * PUT /api/mcp/[serverId] - Update server configuration
 * DELETE /api/mcp/[serverId] - Unregister server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMCPRegistry, getMCPConfig, loadMCPConfigFromEnv } from '@/lib/mcp'
import type { MCPServerConfig } from '@/lib/mcp'

type Params = {
  params: {
    serverId: string
  }
}

/**
 * GET /api/mcp/[serverId]
 * Get detailed information about a specific MCP server
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { serverId } = params

    // Get registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Get server
    const server = registry.getServer(serverId)
    if (!server) {
      return NextResponse.json(
        {
          success: false,
          error: `Server '${serverId}' not found`,
        },
        { status: 404 }
      )
    }

    // Get state
    const state = registry.getServerState(serverId)

    return NextResponse.json({
      success: true,
      data: {
        server,
        state,
      },
    })
  } catch (error) {
    console.error('Error fetching MCP server:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch MCP server',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/mcp/[serverId]
 * Update MCP server configuration
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { serverId } = params
    const updates = await request.json()

    // Get registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Update server
    await registry.updateServer(serverId, updates)

    // Get updated server
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
    console.error('Error updating MCP server:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update MCP server',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mcp/[serverId]
 * Unregister an MCP server
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { serverId } = params

    // Get registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Unregister server
    await registry.unregister(serverId)

    return NextResponse.json({
      success: true,
      message: `Server '${serverId}' unregistered successfully`,
    })
  } catch (error) {
    console.error('Error unregistering MCP server:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unregister MCP server',
      },
      { status: 500 }
    )
  }
}
