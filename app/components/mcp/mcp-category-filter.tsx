/**
 * MCP Category Filter Component
 * 
 * Filter tools by category with visual badges
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TOOL_CATEGORIES } from "@/lib/mcp/categories"
import type { ToolCategoryType } from "@/lib/mcp/types"

interface MCPCategoryFilterProps {
  selectedCategory?: ToolCategoryType | "all"
  onCategoryChange: (category: ToolCategoryType | "all") => void
  categoryCounts?: Record<string, number>
  className?: string
}

export function MCPCategoryFilter({
  selectedCategory = "all",
  onCategoryChange,
  categoryCounts = {},
  className = "",
}: MCPCategoryFilterProps) {
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground">Filter by Category</div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2">
          {/* All Categories */}
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("all")}
            className="shrink-0"
          >
            All
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                {totalCount}
              </Badge>
            )}
          </Button>

          {/* Category Buttons */}
          {TOOL_CATEGORIES.map((category) => {
            const count = categoryCounts[category.id] || 0
            const isSelected = selectedCategory === category.id

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id as ToolCategoryType)}
                className="shrink-0"
                disabled={count === 0}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
