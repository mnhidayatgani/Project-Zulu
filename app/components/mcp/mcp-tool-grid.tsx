/**
 * MCP Tool Grid Component
 * 
 * Display tools in a grid with category filtering and search
 */

"use client"

import { useState, useMemo } from "react"
import { MCPCategoryFilter } from "./mcp-category-filter"
import { MCPToolCard } from "./mcp-tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCategoryDistribution, filterToolsByCategory, searchTools as simpleSearchTools } from "@/lib/mcp/categories"
import { searchTools, type SearchFilter } from "@/lib/mcp/search"
import type { MCPToolMetadata, ToolCategoryType } from "@/lib/mcp/types"
import { MagnifyingGlass, Funnel } from "@phosphor-icons/react"
import { MCPAdvancedSearch } from "./mcp-advanced-search"

interface MCPToolGridProps {
  tools: MCPToolMetadata[]
  onViewDetails?: (tool: MCPToolMetadata) => void
  onUse?: (tool: MCPToolMetadata) => void
  serverId?: string
  serverName?: string
  className?: string
}

export function MCPToolGrid({
  tools,
  onViewDetails,
  onUse,
  serverId,
  serverName,
  className = "",
}: MCPToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategoryType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({ query: "" })

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    return getCategoryDistribution(tools)
  }, [tools])

  // Filter tools by category and search
  const filteredTools = useMemo(() => {
    let filtered = tools

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filterToolsByCategory(filtered, selectedCategory)
    }

    // Filter by search query (simple or advanced)
    if (showAdvancedSearch && searchFilter.query) {
      const searchResults = searchTools(
        filtered,
        searchFilter,
        ['name', 'description', 'category']
      )
      filtered = searchResults.map(r => r.item)
    } else if (searchQuery.trim()) {
      filtered = simpleSearchTools(filtered, searchQuery)
    }

    return filtered
  }, [tools, selectedCategory, searchQuery, showAdvancedSearch, searchFilter])

  const handleSearchChange = (filter: SearchFilter) => {
    setSearchFilter(filter)
    setSearchQuery(filter.query || "")
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      {showAdvancedSearch ? (
        <MCPAdvancedSearch
          value={searchFilter}
          onChange={handleSearchChange}
          resultCount={filteredTools.length}
          onSearch={() => {}}
        />
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvancedSearch(true)}
            title="Advanced Search"
          >
            <Funnel className="size-4" />
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <MCPCategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tools found matching your filters</p>
          {searchQuery && (
            <p className="text-sm mt-2">
              Try adjusting your search or selecting a different category
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <MCPToolCard
                key={tool.name}
                tool={tool}
                serverId={serverId}
                serverName={serverName}
                onViewDetails={onViewDetails}
                onUse={onUse}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
