/**
 * MCP Register Dialog Component
 * 
 * Dialog for registering a new MCP server
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Spinner } from "@phosphor-icons/react"
import type { MCPServerConfig } from "@/lib/mcp"

interface MCPRegisterDialogProps {
  onSuccess?: () => void
}

export function MCPRegisterDialog({ onSuccess }: MCPRegisterDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<MCPServerConfig>>({
    id: '',
    name: '',
    description: '',
    transport: {
      type: 'stdio',
      command: '',
      args: ['stdio'],
      env: {},
    },
    enabled: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mcp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setOpen(false)
        setFormData({
          id: '',
          name: '',
          description: '',
          transport: {
            type: 'stdio',
            command: '',
            args: ['stdio'],
            env: {},
          },
          enabled: true,
        })
        onSuccess?.()
      } else {
        setError(data.error || 'Failed to register server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" weight="bold" />
          Add MCP Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add MCP Server</DialogTitle>
            <DialogDescription>
              Register a new Model Context Protocol server to add tools to your chats.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="id">Server ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="my-mcp-server"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My MCP Server"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this server provide?"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transport-type">Transport Type</Label>
              <Select
                value={formData.transport?.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    transport: { ...formData.transport!, type: value as any },
                  })
                }
              >
                <SelectTrigger id="transport-type">
                  <SelectValue placeholder="Select transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stdio">stdio (Local Command)</SelectItem>
                  <SelectItem value="sse">SSE (Remote Server)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.transport?.type === 'stdio' ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="command">Command</Label>
                  <Input
                    id="command"
                    value={formData.transport.command}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transport: { ...formData.transport!, command: e.target.value },
                      })
                    }
                    placeholder="npx"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="args">Arguments (comma-separated)</Label>
                  <Input
                    id="args"
                    value={formData.transport.args?.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transport: {
                          ...formData.transport!,
                          args: e.target.value.split(',').map((s) => s.trim()),
                        },
                      })
                    }
                    placeholder="-y, @modelcontextprotocol/server-filesystem, stdio"
                  />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.transport?.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transport: { ...formData.transport!, url: e.target.value },
                    })
                  }
                  placeholder="https://mcp-server.example.com"
                  required
                />
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="size-4 mr-2 animate-spin" />}
              Register Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
