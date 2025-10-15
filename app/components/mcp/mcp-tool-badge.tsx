/**
 * MCP Tool Badge Component
 * 
 * Displays a badge to identify MCP tools in the tool invocation UI
 */

"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plugs } from "@phosphor-icons/react"

interface MCPToolBadgeProps {
  serverId: string
  serverName?: string
}

export function MCPToolBadge({ serverId, serverName }: MCPToolBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Plugs className="size-3" weight="bold" />
            MCP
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Tool from MCP server: {serverName || serverId}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
