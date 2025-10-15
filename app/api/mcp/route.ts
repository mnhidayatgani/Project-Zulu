/**
 * MCP Management API
 * 
 * GET /api/mcp - List all MCP servers and their status
 */

import { NextResponse } from 'next/server'
import { getMCPRegistry, getMCPConfig, loadMCPConfigFromEnv } from '@/lib/mcp'

/**
 * GET /api/mcp
 * List all registered MCP servers with their status
 */
export async function GET() {
  try {
    // Get or initialize registry
    const config = getMCPConfig(loadMCPConfigFromEnv())
    const registry = getMCPRegistry(config)

    // Get all servers and their states
    const servers = registry.getServers().map(server => {
      const state = registry.getServerState(server.id)
      return {
        ...server,
        state: state ? {
          connected: state.connected,
          error: state.error,
          toolCount: state.tools.length,
        } : null,
      }
    })

    // Get registry statistics
    const stats = registry.getStats()

    return NextResponse.json({
      success: true,
      data: {
        servers,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching MCP servers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch MCP servers',
      },
      { status: 500 }
    )
  }
}
