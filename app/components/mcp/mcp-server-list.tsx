/**
 * MCP Server List Component
 * 
 * Displays a list of registered MCP servers with their status
 */

"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, Spinner, Plugs, Trash } from "@phosphor-icons/react"
import type { MCPServerConfig } from "@/lib/mcp"

interface MCPServerWithState extends MCPServerConfig {
  state?: {
    connected: boolean
    error?: string
    toolCount: number
  }
}

export function MCPServerList() {
  const [servers, setServers] = useState<MCPServerWithState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/mcp')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data.servers)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const handleToggle = async (serverId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/mcp/${serverId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })

      const data = await response.json()
      if (data.success) {
        fetchServers() // Refresh list
      }
    } catch (err) {
      console.error('Failed to toggle server:', err)
    }
  }

  const handleDelete = async (serverId: string) => {
    if (!confirm('Are you sure you want to remove this MCP server?')) {
      return
    }

    try {
      const response = await fetch(`/api/mcp/${serverId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        fetchServers() // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete server:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (servers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Plugs className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">No MCP servers registered</p>
          <p className="text-muted-foreground text-xs mt-1">
            Add a server to enable MCP tools in your chats
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <Card key={server.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{server.name}</CardTitle>
                  {server.state && (
                    <Badge variant={server.state.connected ? "default" : "secondary"}>
                      {server.state.connected ? (
                        <>
                          <CheckCircle className="size-3 mr-1" weight="fill" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3 mr-1" weight="fill" />
                          Disconnected
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">{server.description}</CardDescription>
                {server.state?.error && (
                  <p className="text-destructive text-xs mt-2">{server.state.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={server.enabled}
                  onCheckedChange={(checked) => handleToggle(server.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(server.id)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {server.state && server.state.toolCount > 0 && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Plugs className="size-4" />
                <span>{server.state.toolCount} tools available</span>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
