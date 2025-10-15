'use client'

/**
 * MCP Marketplace Card
 * 
 * Card component for displaying a discoverable MCP server
 * Shows server info, stats, and install button
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Star, 
  CheckCircle,
  ExternalLink,
  Github,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiscoverableServer } from '@/lib/mcp/discovery'

export interface MCPMarketplaceCardProps {
  /** Server info */
  server: DiscoverableServer
  /** Whether already installed */
  installed?: boolean
  /** Callback when install button clicked */
  onInstall?: (server: DiscoverableServer) => void
  /** Custom className */
  className?: string
}

/**
 * Format number to compact form (e.g., 1.2K, 45K, 1.5M)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * MCP Marketplace Card Component
 */
export function MCPMarketplaceCard({
  server,
  installed = false,
  onInstall,
  className,
}: MCPMarketplaceCardProps) {
  const { config, category, popularity, downloads, rating, ratingCount, verified } = server

  return (
    <Card className={cn('flex flex-col h-full hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="text-4xl flex-shrink-0">
            {config.icon || '📦'}
          </div>

          {/* Title and Author */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <CardTitle className="text-base line-clamp-1">
                {config.name}
              </CardTitle>
              {verified && (
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            {config.author && (
              <p className="text-xs text-muted-foreground truncate">
                by {config.author}
              </p>
            )}
          </div>
        </div>

        <CardDescription className="line-clamp-2 text-xs mt-2">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Category */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          {config.version && (
            <Badge variant="outline" className="text-xs">
              v{config.version}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span>({formatNumber(ratingCount)})</span>
          </div>

          {/* Downloads */}
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{formatNumber(downloads)}</span>
          </div>
        </div>

        {/* Tags */}
        {config.tags && config.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {config.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {config.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{config.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2">
          {server.repository && (
            <a
              href={server.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Github className="h-3 w-3" />
              Code
            </a>
          )}
          {server.documentation && (
            <a
              href={server.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              Docs
            </a>
          )}
          {server.homepage && (
            <a
              href={server.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Site
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          size="sm"
          variant={installed ? 'secondary' : 'default'}
          className="w-full"
          onClick={() => !installed && onInstall?.(server)}
          disabled={installed}
        >
          {installed ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Installed
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Install
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Compact card variant for lists
 */
export function MCPMarketplaceCardCompact({
  server,
  installed,
  onInstall,
  className,
}: MCPMarketplaceCardProps) {
  const { config, category, rating, verified } = server

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        className
      )}
    >
      {/* Icon */}
      <div className="text-2xl flex-shrink-0">
        {config.icon || '📦'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{config.name}</h4>
          {verified && <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {category} • ⭐ {rating.toFixed(1)}
        </p>
      </div>

      {/* Install Button */}
      <Button
        size="sm"
        variant={installed ? 'ghost' : 'default'}
        onClick={() => !installed && onInstall?.(server)}
        disabled={installed}
      >
        {installed ? 'Installed' : 'Install'}
      </Button>
    </div>
  )
}
