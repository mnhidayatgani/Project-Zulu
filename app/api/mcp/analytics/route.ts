/**
 * MCP Analytics API Routes
 * 
 * Endpoints for managing tool usage analytics
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAnalyticsSummary, clearAnalytics } from "@/lib/mcp/analytics"
import { getMCPRegistry } from "@/lib/mcp/registry"

/**
 * GET /api/mcp/analytics
 * Get analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const timePeriod = searchParams.get("period") || "all" // all, today, week, month
    
    // Calculate time filter
    let startTime: Date | undefined
    const now = new Date()
    
    switch (timePeriod) {
      case "today":
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = undefined
    }

    // Get MCP registry to get server IDs and tools
    const registry = getMCPRegistry()
    const servers = await registry.listServers()
    const serverIds = servers.map(s => s.id)
    
    // Get all tools from all servers
    const allTools = servers.flatMap(server => {
      const state = registry.getClientState(server.id)
      return state?.tools || []
    })

    // Get analytics summary
    const summary = getAnalyticsSummary(serverIds, allTools, startTime, now)

    // Convert arrays to serializable format
    const response = {
      ...summary,
      popularTools: summary.popularTools.map(tool => ({
        ...tool,
        lastUsed: tool.lastUsed?.toISOString(),
      })),
      serverHealth: summary.serverHealth.map(server => ({
        ...server,
        firstSeen: server.firstSeen?.toISOString(),
        lastSeen: server.lastSeen?.toISOString(),
      })),
      periodStart: summary.periodStart.toISOString(),
      periodEnd: summary.periodEnd.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mcp/analytics
 * Clear analytics data
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clear analytics
    clearAnalytics()

    return NextResponse.json({ success: true, message: "Analytics cleared" })
  } catch (error) {
    console.error("Error clearing analytics:", error)
    return NextResponse.json(
      { error: "Failed to clear analytics" },
      { status: 500 }
    )
  }
}
