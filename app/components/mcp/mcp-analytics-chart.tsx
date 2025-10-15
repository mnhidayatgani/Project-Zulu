/**
 * MCP Analytics Chart Component
 * 
 * Simple charts for visualizing tool usage and categories
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TOOL_CATEGORIES } from "@/lib/mcp/categories"
import type { ToolCategoryType } from "@/lib/mcp/types"

interface CategoryData {
  category: ToolCategoryType
  count: number
  percentage: number
}

interface MCPAnalyticsChartProps {
  data: Record<string, number>
  title?: string
  description?: string
  type?: "bar" | "distribution"
  className?: string
}

export function MCPAnalyticsChart({
  data,
  title = "Category Distribution",
  description = "Tool usage by category",
  type = "bar",
  className = "",
}: MCPAnalyticsChartProps) {
  const chartData = useMemo(() => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0)
    
    return Object.entries(data)
      .map(([categoryId, count]) => {
        const category = TOOL_CATEGORIES.find((c) => c.id === categoryId)
        return {
          category: categoryId as ToolCategoryType,
          categoryName: category?.name || categoryId,
          categoryIcon: category?.icon || "🔧",
          categoryColor: category?.color || "#6B7280",
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [data])

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.categoryIcon}</span>
                  <span className="font-medium">{item.categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-0 text-xs">
                    {item.count}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {type === "bar" ? (
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.categoryColor,
                    }}
                  />
                </div>
              ) : (
                <Progress
                  value={item.percentage}
                  className="h-2"
                  style={{
                    // @ts-ignore - CSS custom property
                    "--progress-background": item.categoryColor,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
