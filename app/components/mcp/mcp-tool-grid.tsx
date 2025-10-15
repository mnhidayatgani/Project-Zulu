/**
 * MCP Tool Grid Component
 * 
 * Display tools in a grid with category filtering and search
 */

"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { MCPCategoryFilter } from "./mcp-category-filter"
import { MCPToolCard } from "./mcp-tool-card"
import { getCategoryDistribution, filterToolsByCategory, searchTools } from "@/lib/mcp/categories"
import type { MCPToolMetadata, ToolCategoryType } from "@/lib/mcp/types"
import { MagnifyingGlass } from "@phosphor-icons/react"

interface MCPToolGridProps {
  tools: MCPToolMetadata[]
  onViewDetails?: (tool: MCPToolMetadata) => void
  onUse?: (tool: MCPToolMetadata) => void
  className?: string
}

export function MCPToolGrid({
  tools,
  onViewDetails,
  onUse,
  className = "",
}: MCPToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategoryType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

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

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchTools(filtered, searchQuery)
    }

    return filtered
  }, [tools, selectedCategory, searchQuery])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

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
