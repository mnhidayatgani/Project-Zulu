/**
 * MCP Manager Component
 * 
 * Main component for managing MCP servers
 * Combines server list and registration dialog
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MCPServerList } from "./mcp-server-list"
import { MCPRegisterDialog } from "./mcp-register-dialog"
import { MCPToolGrid } from "./mcp-tool-grid"
import { MCPAnalyticsDashboard } from "./mcp-analytics-dashboard"
import { Plugs, ListChecks, GridFour, ChartBar } from "@phosphor-icons/react"
import type { AnalyticsSummary, MCPToolMetadata } from "@/lib/mcp/types"

export function MCPManager() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null)
  const [tools, setTools] = useState<MCPToolMetadata[]>([])
  const [loading, setLoading] = useState(true)

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/mcp/analytics")
        if (response.ok) {
          const data = await response.json()
          setAnalyticsSummary(data)
        }
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleExportAnalytics = async () => {
    try {
      const response = await fetch("/api/mcp/analytics/export?format=json")
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mcp-analytics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export analytics:", error)
    }
  }

  const handleClearAnalytics = async () => {
    if (!confirm("Are you sure you want to clear all analytics data?")) {
      return
    }

    try {
      await fetch("/api/mcp/analytics", { method: "DELETE" })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to clear analytics:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plugs className="size-5" weight="bold" />
                MCP Servers
              </CardTitle>
              <CardDescription className="mt-2">
                Manage Model Context Protocol servers to add custom tools to your AI chats
              </CardDescription>
            </div>
            <MCPRegisterDialog onSuccess={handleSuccess} />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="servers" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="servers">
                <ListChecks className="size-4 mr-2" />
                Servers
              </TabsTrigger>
              <TabsTrigger value="tools">
                <GridFour className="size-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <ChartBar className="size-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="about">About MCP</TabsTrigger>
            </TabsList>

            <TabsContent value="servers" className="mt-6" key={refreshKey}>
              <MCPServerList />
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <MCPToolGrid
                tools={tools}
                onViewDetails={(tool) => {
                  // TODO: Open tool details dialog
                  console.log("View tool details:", tool)
                }}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading analytics...
                </div>
              ) : analyticsSummary ? (
                <MCPAnalyticsDashboard
                  summary={analyticsSummary}
                  onExport={handleExportAnalytics}
                  onClear={handleClearAnalytics}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3>What is MCP?</h3>
                <p>
                  Model Context Protocol (MCP) is an open protocol that standardizes how AI
                  applications interact with external tools and data sources.
                </p>

                <h3>How to use MCP in Zola?</h3>
                <ol>
                  <li>
                    <strong>Register a server</strong>: Click "Add MCP Server" to register a new
                    MCP server
                  </li>
                  <li>
                    <strong>Enable the server</strong>: Toggle the switch to enable/disable the
                    server
                  </li>
                  <li>
                    <strong>Use tools in chat</strong>: When enabled, MCP tools will be available
                    to the AI during conversations
                  </li>
                </ol>

                <h3>Example MCP Servers</h3>
                <ul>
                  <li>
                    <strong>Filesystem</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-filesystem stdio</code>
                  </li>
                  <li>
                    <strong>GitHub</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-github stdio</code>
                  </li>
                  <li>
                    <strong>Fetch</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-fetch stdio</code>
                  </li>
                  <li>
                    <strong>Memory</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-memory stdio</code>
                  </li>
                </ul>

                <h3>Learn More</h3>
                <p>
                  Visit{" "}
                  <a
                    href="https://modelcontextprotocol.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    modelcontextprotocol.io
                  </a>{" "}
                  for documentation and more MCP servers.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3>What is MCP?</h3>
                <p>
                  Model Context Protocol (MCP) is an open protocol that standardizes how AI
                  applications interact with external tools and data sources.
                </p>

                <h3>How to use MCP in Zola?</h3>
                <ol>
                  <li>
                    <strong>Register a server</strong>: Click "Add MCP Server" to register a new
                    MCP server
                  </li>
                  <li>
                    <strong>Enable the server</strong>: Toggle the switch to enable/disable the
                    server
                  </li>
                  <li>
                    <strong>Use tools in chat</strong>: When enabled, MCP tools will be available
                    to the AI during conversations
                  </li>
                </ol>

                <h3>Example MCP Servers</h3>
                <ul>
                  <li>
                    <strong>Filesystem</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-filesystem stdio</code>
                  </li>
                  <li>
                    <strong>GitHub</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-github stdio</code>
                  </li>
                  <li>
                    <strong>Fetch</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-fetch stdio</code>
                  </li>
                  <li>
                    <strong>Memory</strong>:{" "}
                    <code>npx -y @modelcontextprotocol/server-memory stdio</code>
                  </li>
                </ul>

                <h3>Learn More</h3>
                <p>
                  Visit{" "}
                  <a
                    href="https://modelcontextprotocol.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    modelcontextprotocol.io
                  </a>{" "}
                  for documentation and more MCP servers.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
