/**
 * MCP Analytics Dashboard Component
 * 
 * Display comprehensive analytics for MCP tools and servers
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MCPAnalyticsChart } from "./mcp-analytics-chart"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChartBar,
  TrendUp,
  CheckCircle,
  XCircle,
  Clock,
  Lightning,
  HardDrives,
  Download,
} from "@phosphor-icons/react"
import type { AnalyticsSummary } from "@/lib/mcp/types"

interface MCPAnalyticsDashboardProps {
  summary: AnalyticsSummary
  onExport?: () => void
  onClear?: () => void
  className?: string
}

export function MCPAnalyticsDashboard({
  summary,
  onExport,
  onClear,
  className = "",
}: MCPAnalyticsDashboardProps) {
  // Get top tools
  const topTools = useMemo(() => {
    return summary.popularTools.slice(0, 10)
  }, [summary.popularTools])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ChartBar className="size-5" weight="bold" />
            Analytics Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track tool usage and server performance
          </p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          )}
          {onClear && (
            <Button size="sm" variant="outline" onClick={onClear}>
              Clear Data
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Executions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Lightning className="size-6 text-primary" weight="fill" />
              {summary.totalExecutions}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle className="size-6 text-green-500" weight="fill" />
              {(summary.overallSuccessRate * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tools</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <XCircle className="size-6 text-blue-500" weight="fill" />
              {summary.totalTools}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Servers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <HardDrives className="size-6 text-purple-500" weight="fill" />
              {summary.activeServers}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Top Tools</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        {/* Top Tools */}
        <TabsContent value="tools" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Most Used Tools</CardTitle>
              <CardDescription>Tools ranked by usage count</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {topTools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tools have been used yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topTools.map((analytics, index) => (
                      <div key={analytics.toolName} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Badge variant="outline" className="shrink-0">
                              #{index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{analytics.toolName}</div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{analytics.usageCount} uses</span>
                                <span>
                                  {analytics.avgExecutionTime.toFixed(0)}ms avg
                                </span>
                                {analytics.lastUsed && (
                                  <span>
                                    Last: {new Date(analytics.lastUsed).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={analytics.successRate >= 80 ? "default" : "secondary"}
                            className={
                              analytics.successRate < 50 ? "bg-destructive" : ""
                            }
                          >
                            {(analytics.successRate * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {index < topTools.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-6">
          <MCPAnalyticsChart
            data={summary.categoryDistribution}
            title="Tool Usage by Category"
            description="Distribution of tool executions across categories"
            type="bar"
          />
        </TabsContent>

        {/* Servers */}
        <TabsContent value="servers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Server Health</CardTitle>
              <CardDescription>Performance metrics for each server</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {summary.serverHealth.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No server data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summary.serverHealth.map((server, index) => {
                      const healthScore = server.totalExecutions > 0
                        ? ((server.totalExecutions - server.totalFailures) / server.totalExecutions) * 100
                        : 100

                      return (
                        <div key={server.serverId} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <HardDrives className="size-4 shrink-0" weight="bold" />
                                <span className="truncate">{server.serverId}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Lightning className="size-3" />
                                  {server.totalExecutions} executions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {server.uptimePercentage.toFixed(1)}% uptime
                                </span>
                                {server.totalFailures > 0 && (
                                  <span className="flex items-center gap-1 text-destructive">
                                    <XCircle className="size-3" />
                                    {server.totalFailures} failures
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={healthScore >= 80 ? "default" : "secondary"}
                              className={healthScore < 50 ? "bg-destructive" : ""}
                            >
                              {healthScore.toFixed(0)}%
                            </Badge>
                          </div>
                          {index < summary.serverHealth.length - 1 && <Separator />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Popular Tools Summary */}
      {summary.popularTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendUp className="size-4" weight="bold" />
              Trending Tools
            </CardTitle>
            <CardDescription>Most frequently used tools this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.popularTools.slice(0, 10).map((tool) => (
                <Badge key={tool.toolName} variant="secondary" className="px-3 py-1">
                  {tool.toolName}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {tool.usageCount}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ChartBar className="size-5" weight="bold" />
            Analytics Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track tool usage and server performance
          </p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          )}
          {onClear && (
            <Button size="sm" variant="outline" onClick={onClear}>
              Clear Data
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Executions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Lightning className="size-6 text-primary" weight="fill" />
              {overallStats.totalExecutions}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle className="size-6 text-green-500" weight="fill" />
              {overallStats.avgSuccessRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed Executions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <XCircle className="size-6 text-destructive" weight="fill" />
              {overallStats.totalFailed}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Servers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Server className="size-6 text-blue-500" weight="fill" />
              {overallStats.totalServers}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Top Tools</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        {/* Top Tools */}
        <TabsContent value="tools" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Most Used Tools</CardTitle>
              <CardDescription>Tools ranked by usage count</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {topTools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tools have been used yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topTools.map(([toolName, analytics], index) => (
                      <div key={toolName} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Badge variant="outline" className="shrink-0">
                              #{index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{toolName}</div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{analytics.count} uses</span>
                                <span>
                                  {analytics.avgExecutionTime.toFixed(0)}ms avg
                                </span>
                                {analytics.lastUsed && (
                                  <span>
                                    Last: {new Date(analytics.lastUsed).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={analytics.successRate >= 80 ? "default" : "secondary"}
                            className={
                              analytics.successRate < 50 ? "bg-destructive" : ""
                            }
                          >
                            {analytics.successRate.toFixed(0)}%
                          </Badge>
                        </div>
                        {index < topTools.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-6">
          <MCPAnalyticsChart
            data={summary.categoryDistribution}
            title="Tool Usage by Category"
            description="Distribution of tool executions across categories"
            type="bar"
          />
        </TabsContent>

        {/* Servers */}
        <TabsContent value="servers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Server Health</CardTitle>
              <CardDescription>Performance metrics for each server</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {serverHealth.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No server data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serverHealth.map((server, index) => (
                      <div key={server.serverId} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <Server className="size-4 shrink-0" weight="bold" />
                              <span className="truncate">{server.serverId}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Lightning className="size-3" />
                                {server.totalExecutions} executions
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {server.uptimePercentage.toFixed(1)}% uptime
                              </span>
                              {server.totalFailures > 0 && (
                                <span className="flex items-center gap-1 text-destructive">
                                  <XCircle className="size-3" />
                                  {server.totalFailures} failures
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={server.healthScore >= 80 ? "default" : "secondary"}
                            className={server.healthScore < 50 ? "bg-destructive" : ""}
                          >
                            {server.healthScore.toFixed(0)}%
                          </Badge>
                        </div>
                        {index < serverHealth.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Popular Tools Summary */}
      {summary.popularTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendUp className="size-4" weight="bold" />
              Trending Tools
            </CardTitle>
            <CardDescription>Most frequently used tools this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.popularTools.slice(0, 10).map((tool) => (
                <Badge key={tool.toolName} variant="secondary" className="px-3 py-1">
                  {tool.toolName}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {tool.usageCount}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
