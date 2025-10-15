'use client'

import * as React from 'react'
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  loadExecutionHistory,
  filterExecutions,
  getExecutionStats,
  rerunExecution,
  deleteExecution,
  clearExecutionHistory,
  exportExecutions,
  exportExecutionsCSV,
  importExecutions,
  formatDuration,
  getStatusColor,
  analyzeExecutionPatterns,
  type ExecutionRecord,
  type ExecutionFilter,
  type ExecutionStats
} from '@/lib/mcp/execution-history'
import { MCPExecutionLogItem } from './mcp-execution-log-item'

interface MCPExecutionHistoryProps {
  trigger?: React.ReactNode
  onRerun?: (execution: ExecutionRecord) => void
}

/**
 * Execution history viewer with analytics
 */
export function MCPExecutionHistory({
  trigger,
  onRerun
}: MCPExecutionHistoryProps) {
  const [open, setOpen] = React.useState(false)
  const [executions, setExecutions] = React.useState<ExecutionRecord[]>([])
  const [stats, setStats] = React.useState<ExecutionStats | null>(null)
  const [filter, setFilter] = React.useState<ExecutionFilter>({})
  const [searchQuery, setSearchQuery] = React.useState('')
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false)

  // Load data
  React.useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = () => {
    const history = loadExecutionHistory()
    setExecutions(history)
    setStats(getExecutionStats())
  }

  const filteredExecutions = React.useMemo(() => {
    let filtered = filterExecutions(filter)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        e =>
          e.toolName.toLowerCase().includes(query) ||
          e.serverName.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [executions, filter, searchQuery])

  const handleRerun = (execution: ExecutionRecord) => {
    const newExecution = rerunExecution(execution.id)
    onRerun?.(newExecution)
    loadData()
  }

  const handleDelete = (executionId: string) => {
    if (confirm('Delete this execution record?')) {
      deleteExecution(executionId)
      loadData()
    }
  }

  const handleClearAll = () => {
    const count = clearExecutionHistory()
    alert(`Cleared ${count} execution records`)
    setClearDialogOpen(false)
    loadData()
  }

  const handleExportJSON = () => {
    const json = exportExecutions(filter)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-executions-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csv = exportExecutionsCSV(filter)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-executions-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const json = e.target?.result as string
            const count = importExecutions(json)
            alert(`Imported ${count} execution records`)
            loadData()
          } catch (error) {
            alert((error as Error).message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Execution History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Execution History & Analytics
          </DialogTitle>
          <DialogDescription>
            View and analyze MCP tool execution history
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="history" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="flex-1 flex flex-col gap-4 mt-4">
            {/* Filters & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search executions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={filter.status || 'all'}
                onValueChange={(v) => setFilter({
                  ...filter,
                  status: v === 'all' ? undefined : v as any
                })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>

              <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Execution History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all execution records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Execution List */}
            <ScrollArea className="flex-1">
              {filteredExecutions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Execute MCP tools to see history here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {filteredExecutions.map((execution) => (
                    <MCPExecutionLogItem
                      key={execution.id}
                      execution={execution}
                      onRerun={handleRerun}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 mt-4">
            {stats && <ExecutionStatsView stats={stats} />}
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 mt-4">
            <ExecutionAnalytics />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ==================== SUB COMPONENTS ====================

interface ExecutionStatsViewProps {
  stats: ExecutionStats
}

function ExecutionStatsView({ stats }: ExecutionStatsViewProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalExecutions}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Success</span>
            </div>
            <p className="text-3xl font-bold">{stats.successCount}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <p className="text-3xl font-bold">{stats.errorCount}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Avg Duration</span>
            </div>
            <p className="text-3xl font-bold">
              {formatDuration(stats.averageDuration)}
            </p>
          </div>
        </div>

        {/* Most Used Tools */}
        {stats.mostUsedTools.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Most Used Tools</h3>
            <div className="space-y-2">
              {stats.mostUsedTools.map((tool, index) => (
                <div
                  key={tool.toolName}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{tool.toolName}</span>
                  </div>
                  <Badge variant="secondary">{tool.count} executions</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {stats.recentErrors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Recent Errors</h3>
            <div className="space-y-2">
              {stats.recentErrors.map((execution) => (
                <div
                  key={execution.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{execution.toolName}</p>
                      <p className="text-xs text-muted-foreground">
                        {execution.serverName}
                      </p>
                    </div>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                  {execution.error && (
                    <p className="text-sm text-red-500">{execution.error}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(execution.startTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

function ExecutionAnalytics() {
  const [patterns, setPatterns] = React.useState(analyzeExecutionPatterns())

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        {/* Success Rate */}
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="font-semibold mb-3">Success Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${patterns.successRate}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold">
              {patterns.successRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Average Per Day */}
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="font-semibold mb-2">Average Executions Per Day</h3>
          <p className="text-3xl font-bold">
            {patterns.averageExecutionsPerDay.toFixed(1)}
          </p>
        </div>

        {/* Peak Hours */}
        {patterns.peakHours.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Peak Usage Hours</h3>
            <div className="space-y-2">
              {patterns.peakHours.map((peak) => (
                <div
                  key={peak.hour}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <span className="font-medium">
                    {peak.hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(peak.count / Math.max(...patterns.peakHours.map(p => p.count))) * 100}%`
                        }}
                      />
                    </div>
                    <Badge variant="secondary">{peak.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Errors */}
        {patterns.commonErrors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Common Errors</h3>
            <div className="space-y-2">
              {patterns.commonErrors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1 break-words">{error.error}</p>
                    <Badge variant="destructive">{error.count}×</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
