'use client'

/**
 * MCP Sync Settings Component
 * 
 * Settings panel for MCP sync configuration:
 * - Enable/disable auto-sync
 * - View sync statistics
 * - Clear sync data
 * - Manual sync trigger
 */

import React, { useEffect, useState } from 'react'
import { 
  CloudArrowUp, 
  Trash, 
  Info,
  Warning,
  Database
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MCPSyncStatus } from './mcp-sync-status'
import { MCPSyncButton } from './mcp-sync-button'
import { cn } from '@/lib/utils'

interface SyncStats {
  favorites: number
  collections: number
  searches: number
  history: number
  executions: number
  totalSize: number
}

export function MCPSyncSettings() {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [stats, setStats] = useState<SyncStats>({
    favorites: 0,
    collections: 0,
    searches: 0,
    history: 0,
    executions: 0,
    totalSize: 0
  })
  const [isClearing, setIsClearing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Load sync stats
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { getSyncStats } = await import('@/lib/mcp/sync')
      const syncStats = await getSyncStats()
      setStats(syncStats)
    } catch (error) {
      console.error('Failed to load sync stats:', error)
    }
  }

  const handleAutoSyncToggle = async (enabled: boolean) => {
    setAutoSyncEnabled(enabled)
    
    try {
      const { setAutoSync } = await import('@/lib/mcp/sync')
      await setAutoSync(enabled)
    } catch (error) {
      console.error('Failed to toggle auto-sync:', error)
      setAutoSyncEnabled(!enabled) // Revert on error
    }
  }

  const handleClearData = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsClearing(true)
    try {
      const { clearAllSyncData } = await import('@/lib/mcp/sync')
      await clearAllSyncData()
      await loadStats() // Reload stats
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to clear sync data:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Sync Status</h3>
        <MCPSyncStatus showDetails className="w-full" />
      </div>

      <Separator />

      {/* Auto-sync Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync" className="text-base">
              Auto-sync
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically sync changes to the cloud
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={handleAutoSyncToggle}
          />
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            When enabled, your favorites, searches, and execution history will sync
            across all your devices in real-time.
          </AlertDescription>
        </Alert>
      </div>

      <Separator />

      {/* Manual Sync */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Manual Sync</h3>
        <p className="text-sm text-muted-foreground">
          Force sync all your MCP data immediately
        </p>
        <MCPSyncButton 
          variant="default"
          onSyncComplete={(success, message) => {
            if (success) loadStats()
          }}
        />
      </div>

      <Separator />

      {/* Sync Statistics */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Sync Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favorites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.searches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.executions}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total sync data</span>
          </div>
          <span className="text-sm font-medium">{formatSize(stats.totalSize)}</span>
        </div>
      </div>

      <Separator />

      {/* Clear Data */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Clear all synced data from the cloud. Local data will remain.
        </p>

        {showConfirm && (
          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertDescription>
              Are you sure? This will delete all your synced favorites, searches,
              and execution history from the cloud. This action cannot be undone.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleClearData}
            disabled={isClearing}
          >
            <Trash className="h-4 w-4 mr-2" />
            {showConfirm ? 'Confirm Delete' : 'Clear Sync Data'}
          </Button>
          {showConfirm && (
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
