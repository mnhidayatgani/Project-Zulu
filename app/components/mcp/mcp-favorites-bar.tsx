'use client'

import * as React from 'react'
import { Star, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  getQuickAccess,
  removeFromQuickAccess,
  type FavoriteTool
} from '@/lib/mcp/favorites'

interface MCPFavoritesBarProps {
  onToolSelect?: (tool: FavoriteTool) => void
  className?: string
}

/**
 * Quick access favorites bar
 * Shows up to 8 favorite tools for quick access
 */
export function MCPFavoritesBar({
  onToolSelect,
  className
}: MCPFavoritesBarProps) {
  const [quickAccess, setQuickAccess] = React.useState<FavoriteTool[]>([])
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Load quick access tools
  React.useEffect(() => {
    loadQuickAccess()

    // Listen for changes
    const handleStorageChange = () => {
      loadQuickAccess()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('mcp-favorites-changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('mcp-favorites-changed', handleStorageChange)
    }
  }, [])

  const loadQuickAccess = () => {
    const tools = getQuickAccess()
    setQuickAccess(tools)
  }

  const handleRemove = (tool: FavoriteTool, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromQuickAccess(tool.serverId, tool.toolName)
    loadQuickAccess()
    window.dispatchEvent(new Event('mcp-favorites-changed'))
  }

  const handleToolClick = (tool: FavoriteTool) => {
    onToolSelect?.(tool)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  if (quickAccess.length === 0) {
    return null
  }

  if (isCollapsed) {
    return (
      <div className={cn('flex items-center gap-2 p-2 border-b bg-muted/20', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          <span>Show Quick Access ({quickAccess.length})</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('border-b bg-muted/20', className)}>
      <div className="flex items-center gap-2 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="gap-2 flex-shrink-0"
        >
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">Quick Access</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="relative flex-1 min-w-0">
          {quickAccess.length > 4 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-8"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {quickAccess.map((tool, index) => (
              <QuickAccessTool
                key={`${tool.serverId}:${tool.toolName}`}
                tool={tool}
                onClick={handleToolClick}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

interface QuickAccessToolProps {
  tool: FavoriteTool
  onClick: (tool: FavoriteTool) => void
  onRemove: (tool: FavoriteTool, e: React.MouseEvent) => void
}

function QuickAccessTool({ tool, onClick, onRemove }: QuickAccessToolProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background',
              'cursor-pointer transition-all duration-200 flex-shrink-0',
              'hover:border-primary hover:shadow-sm',
              isHovered && 'pr-8'
            )}
            onClick={() => onClick(tool)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Zap className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {tool.toolName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                {tool.serverName}
              </span>
            </div>

            {isHovered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onRemove(tool, e)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10"
              >
                <X className="h-3 w-3 text-destructive" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{tool.toolName}</p>
            <p className="text-xs text-muted-foreground">{tool.serverName}</p>
            {tool.toolDescription && (
              <p className="text-xs">{tool.toolDescription}</p>
            )}
            {tool.useCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Used {tool.useCount} times
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
