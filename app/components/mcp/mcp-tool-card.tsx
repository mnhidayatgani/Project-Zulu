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
import { Code } from "@phosphor-icons/react"

interface MCPToolCardProps {
  tool: MCPToolMetadata
  onViewDetails?: (tool: MCPToolMetadata) => void
  onUse?: (tool: MCPToolMetadata) => void
}

export function MCPToolCard({ tool, onViewDetails, onUse }: MCPToolCardProps) {
  const category = TOOL_CATEGORIES.find((c) => c.id === tool.category)

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="size-4 shrink-0" weight="bold" />
              <span className="truncate">{tool.name}</span>
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
