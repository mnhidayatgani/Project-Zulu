/**
 * MCP Tool Card Component
 * 
 * Display individual tool with category badge
 */

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TOOL_CATEGORIES } from "@/lib/mcp/categories"
import type { MCPToolMetadata } from "@/lib/mcp/types"
import { Code, Star } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { isFavorite, addFavorite, removeFavorite } from "@/lib/mcp/favorites"

interface MCPToolCardProps {
  tool: MCPToolMetadata
  onViewDetails?: (tool: MCPToolMetadata) => void
  onUse?: (tool: MCPToolMetadata) => void
  serverId?: string
  serverName?: string
}

export function MCPToolCard({ tool, onViewDetails, onUse, serverId = "unknown", serverName = "Unknown Server" }: MCPToolCardProps) {
  const category = TOOL_CATEGORIES.find((c) => c.id === tool.category)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    setIsFavorited(isFavorite(serverId, tool.name))
  }, [serverId, tool.name])

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavorite(serverId, tool.name)
      setIsFavorited(false)
    } else {
      addFavorite({
        serverId,
        serverName,
        toolName: tool.name,
        toolDescription: tool.description,
        tags: tool.category ? [tool.category] : []
      })
      setIsFavorited(true)
    }
    
    // Dispatch event to update favorites bar
    window.dispatchEvent(new Event('mcp-favorites-changed'))
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="size-4 shrink-0" weight="bold" />
              <span className="truncate">{tool.name}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleToggleFavorite}
                      className="h-6 w-6 p-0 ml-auto"
                    >
                      <Star
                        className="size-4"
                        weight={isFavorited ? "fill" : "regular"}
                        style={{ color: isFavorited ? "#fbbf24" : "currentColor" }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isFavorited ? "Remove from favorites" : "Add to favorites"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">
              {tool.description || "No description provided"}
            </CardDescription>
          </div>
          
          {category && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="shrink-0"
                    style={{
                      backgroundColor: `${category.color}15`,
                      borderColor: category.color,
                      color: category.color,
                    }}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{category.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Tool Parameters */}
          {tool.inputSchema && Object.keys(tool.inputSchema.properties || {}).length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Parameters:</span>{" "}
              {Object.keys(tool.inputSchema.properties).join(", ")}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(tool)}
                className="flex-1"
              >
                View Details
              </Button>
            )}
            {onUse && (
              <Button size="sm" onClick={() => onUse(tool)} className="flex-1">
                Use Tool
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
