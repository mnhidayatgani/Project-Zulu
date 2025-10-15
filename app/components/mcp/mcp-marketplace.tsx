'use client'

/**
 * MCP Marketplace
 * 
 * Browse and discover available MCP servers
 * Install servers with one click
 */

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MCPMarketplaceCard } from './mcp-marketplace-card'
import type { DiscoverableServer, DiscoveryFilters } from '@/lib/mcp/discovery'

export interface MCPMarketplaceProps {
  /** Callback when installing a server */
  onInstall?: (server: DiscoverableServer) => void
  /** List of already installed server IDs */
  installedServerIds?: string[]
  /** Custom className */
  className?: string
}

/**
 * MCP Marketplace Component
 */
export function MCPMarketplace({
  onInstall,
  installedServerIds = [],
  className,
}: MCPMarketplaceProps) {
  const [servers, setServers] = useState<DiscoverableServer[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<DiscoveryFilters['sortBy']>('popularity')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch servers when filters change
  useEffect(() => {
    fetchServers()
  }, [searchQuery, selectedCategory, sortBy, verifiedOnly])

  /**
   * Fetch available categories
   */
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/mcp/discover?action=categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  /**
   * Fetch servers based on current filters
   */
  const fetchServers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (sortBy) params.set('sortBy', sortBy)
      if (verifiedOnly) params.set('verifiedOnly', 'true')
      
      const response = await fetch(`/api/mcp/discover?${params}`)
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch servers:', error)
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch popular servers
   */
  const fetchPopular = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mcp/discover?action=popular&limit=10')
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch popular servers:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch recent servers
   */
  const fetchRecent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mcp/discover?action=recent&limit=10')
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch recent servers:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch recommended servers
   */
  const fetchRecommended = async () => {
    setLoading(true)
    try {
      const installed = installedServerIds.join(',')
      const response = await fetch(
        `/api/mcp/discover?action=recommended&installed=${installed}&limit=10`
      )
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch recommended servers:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSortBy('popularity')
    setVerifiedOnly(false)
  }

  const hasFilters = searchQuery || selectedCategory !== 'all' || verifiedOnly

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MCP Marketplace</h2>
          <p className="text-sm text-muted-foreground">
            Discover and install MCP servers to extend functionality
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => fetchServers()}>
            All Servers
          </TabsTrigger>
          <TabsTrigger value="popular" onClick={fetchPopular}>
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="recent" onClick={fetchRecent}>
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Recent
          </TabsTrigger>
          {installedServerIds.length > 0 && (
            <TabsTrigger value="recommended" onClick={fetchRecommended}>
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Recommended
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Verified Filter */}
            <Button
              variant={verifiedOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className="w-full md:w-auto"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Verified Only
            </Button>

            {/* Clear Filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {loading ? (
              'Loading...'
            ) : (
              `${servers.length} server${servers.length !== 1 ? 's' : ''} found`
            )}
          </div>

          {/* Server Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : servers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <MCPMarketplaceCard
                  key={server.config.id}
                  server={server}
                  installed={installedServerIds.includes(server.config.id)}
                  onInstall={onInstall}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No servers found matching your criteria.
              {hasFilters && (
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="block mx-auto mt-2"
                >
                  Clear filters and try again
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents would just show the filtered results */}
        <TabsContent value="popular" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <MCPMarketplaceCard
                  key={server.config.id}
                  server={server}
                  installed={installedServerIds.includes(server.config.id)}
                  onInstall={onInstall}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <MCPMarketplaceCard
                  key={server.config.id}
                  server={server}
                  installed={installedServerIds.includes(server.config.id)}
                  onInstall={onInstall}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <MCPMarketplaceCard
                  key={server.config.id}
                  server={server}
                  installed={installedServerIds.includes(server.config.id)}
                  onInstall={onInstall}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
