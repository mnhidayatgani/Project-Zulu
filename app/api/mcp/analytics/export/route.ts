/**
 * MCP Analytics Export API
 * 
 * Export analytics data in various formats
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exportAnalytics } from "@/lib/mcp/analytics"

/**
 * GET /api/mcp/analytics/export
 * Export analytics data
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
    const format = searchParams.get("format") || "json" // json or csv

    // Export analytics
    const data = exportAnalytics()

    if (format === "csv") {
      // Convert to CSV
      const csv = convertToCSV(data)
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="mcp-analytics-${Date.now()}.csv"`,
        },
      })
    }

    // Return JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mcp-analytics-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    )
  }
}

/**
 * Convert analytics data to CSV format
 */
function convertToCSV(data: any): string {
  const lines: string[] = []

  // Tool usage events
  lines.push("# Tool Usage Events")
  lines.push("Tool Name,Timestamp,Duration (ms),Success,Error")
  
  for (const event of data.usageEvents) {
    lines.push(
      [
        event.toolName,
        event.timestamp,
        event.executionTime,
        event.success,
        event.error || "",
      ].join(",")
    )
  }

  lines.push("")

  // Server connections
  lines.push("# Server Connections")
  lines.push("Server ID,Connected At,Disconnected At,Failures")
  
  for (const [serverId, connections] of Object.entries(data.serverConnections)) {
    for (const conn of connections as any[]) {
      lines.push(
        [
          serverId,
          conn.connectedAt,
          conn.disconnectedAt || "",
          conn.failures,
        ].join(",")
      )
    }
  }

  return lines.join("\n")
}
