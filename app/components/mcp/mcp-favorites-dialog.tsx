'use client'

import * as React from 'react'
import {
  Star,
  Heart,
  Bookmark,
  Trash2,
  Edit,
  Plus,
  FolderOpen,
  Share2,
  Download,
  Upload,
  Search,
  X,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  getFavorites,
  getCollections,
  sortFavorites,
  addToQuickAccess,
  removeFromQuickAccess,
  isInQuickAccess,
  removeFavorite,
  createCollection,
  deleteCollection,
  updateCollection,
  addToCollection,
  removeFromCollection,
  getFavoritesStats,
  exportCollection,
  importCollection,
  generateShareCode,
  type FavoriteTool,
  type FavoriteCollection
} from '@/lib/mcp/favorites'

interface MCPFavoritesDialogProps {
  trigger?: React.ReactNode
  onToolSelect?: (tool: FavoriteTool) => void
}

type SortOption = 'name' | 'recent' | 'popular' | 'added'

/**
 * Favorites management dialog
 * Full-featured UI for managing favorites and collections
 */
export function MCPFavoritesDialog({
  trigger,
  onToolSelect
}: MCPFavoritesDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [favorites, setFavorites] = React.useState<FavoriteTool[]>([])
  const [collections, setCollections] = React.useState<FavoriteCollection[]>([])
  const [sortBy, setSortBy] = React.useState<SortOption>('recent')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null)

  // Load data
  React.useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = () => {
    const favs = getFavorites()
    const cols = getCollections()
    setFavorites(sortFavorites(favs, sortBy))
    setCollections(cols)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setFavorites(sortFavorites(favorites, newSort))
  }

  const filteredFavorites = React.useMemo(() => {
    let filtered = favorites

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        f =>
          f.toolName.toLowerCase().includes(query) ||
          f.serverName.toLowerCase().includes(query) ||
          f.toolDescription?.toLowerCase().includes(query) ||
          f.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [favorites, searchQuery])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Star className="h-4 w-4" />
            Favorites
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Favorites & Collections
          </DialogTitle>
          <DialogDescription>
            Manage your favorite MCP tools and organize them into collections
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="favorites" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="flex-1 flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Most Used</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="added">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1">
              {filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Star your favorite MCP tools to quickly access them here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {filteredFavorites.map((tool) => (
                    <FavoriteToolCard
                      key={`${tool.serverId}:${tool.toolName}`}
                      tool={tool}
                      collections={collections}
                      onSelect={onToolSelect}
                      onUpdate={loadData}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="collections" className="flex-1 flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {collections.length} Collection{collections.length !== 1 ? 's' : ''}
              </h3>
              <CreateCollectionDialog onCreated={loadData} />
            </div>

            <ScrollArea className="flex-1">
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    Create collections to organize your favorite tools
                  </p>
                  <CreateCollectionDialog onCreated={loadData} />
                </div>
              ) : (
                <div className="grid gap-4 pr-4">
                  {collections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      onUpdate={loadData}
                      onToolSelect={onToolSelect}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 mt-4">
            <FavoritesStats />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ==================== SUB COMPONENTS ====================

interface FavoriteToolCardProps {
  tool: FavoriteTool
  collections: FavoriteCollection[]
  onSelect?: (tool: FavoriteTool) => void
  onUpdate: () => void
}

function FavoriteToolCard({ tool, collections, onSelect, onUpdate }: FavoriteToolCardProps) {
  const [showActions, setShowActions] = React.useState(false)
  const inQuickAccess = isInQuickAccess(tool.serverId, tool.toolName)

  const handleToggleQuickAccess = () => {
    if (inQuickAccess) {
      removeFromQuickAccess(tool.serverId, tool.toolName)
    } else {
      try {
        addToQuickAccess(tool.serverId, tool.toolName)
      } catch (error) {
        alert((error as Error).message)
      }
    }
    onUpdate()
    window.dispatchEvent(new Event('mcp-favorites-changed'))
  }

  const handleRemove = () => {
    if (confirm('Remove this tool from favorites?')) {
      removeFavorite(tool.serverId, tool.toolName)
      onUpdate()
      window.dispatchEvent(new Event('mcp-favorites-changed'))
    }
  }

  return (
    <div
      className={cn(
        'group relative p-4 rounded-lg border bg-card',
        'transition-all duration-200',
        'hover:border-primary hover:shadow-sm'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{tool.toolName}</h4>
            {inQuickAccess && (
              <Badge variant="secondary" className="text-xs">
                Quick Access
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{tool.serverName}</p>

          {tool.toolDescription && (
            <p className="text-sm line-clamp-2">{tool.toolDescription}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {tool.useCount > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {tool.useCount} uses
              </span>
            )}
            {tool.lastUsed && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(tool.lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>

          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleQuickAccess}
              className="h-8 w-8 p-0"
            >
              <Sparkles className={cn('h-4 w-4', inQuickAccess && 'text-primary')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect?.(tool)}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface CollectionCardProps {
  collection: FavoriteCollection
  onUpdate: () => void
  onToolSelect?: (tool: FavoriteTool) => void
}

function CollectionCard({ collection, onUpdate, onToolSelect }: CollectionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const handleDelete = () => {
    deleteCollection(collection.id)
    onUpdate()
    setDeleteDialogOpen(false)
  }

  const handleExport = () => {
    const json = exportCollection(collection.id)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collection.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{collection.name}</h3>
              {collection.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {collection.tools.length} tool{collection.tools.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleExport()
              }}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This will remove the collection but keep the tools in your favorites.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>
      </div>

      {isExpanded && collection.tools.length > 0 && (
        <div className="border-t p-4 space-y-2 bg-muted/20">
          {collection.tools.map((tool) => (
            <div
              key={`${tool.serverId}:${tool.toolName}`}
              className="p-3 rounded-lg border bg-background cursor-pointer hover:border-primary transition-colors"
              onClick={() => onToolSelect?.(tool)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tool.toolName}</p>
                  <p className="text-xs text-muted-foreground">{tool.serverName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateCollectionDialogProps {
  onCreated: () => void
}

function CreateCollectionDialog({ onCreated }: CreateCollectionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a collection name')
      return
    }

    try {
      createCollection(name, { description })
      setName('')
      setDescription('')
      setOpen(false)
      onCreated()
    } catch (error) {
      alert((error as Error).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your favorite tools
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FavoritesStats() {
  const [stats, setStats] = React.useState(getFavoritesStats())

  React.useEffect(() => {
    setStats(getFavoritesStats())
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Total Favorites</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalFavorites}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Collections</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalCollections}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Quick Access</span>
            </div>
            <p className="text-3xl font-bold">{stats.quickAccessCount}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Total Usage</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalUsage}</p>
          </div>
        </div>

        {stats.mostUsed.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Most Used Tools</h3>
            <div className="space-y-2">
              {stats.mostUsed.map((tool, index) => (
                <div
                  key={`${tool.serverId}:${tool.toolName}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{tool.toolName}</p>
                      <p className="text-xs text-muted-foreground">{tool.serverName}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{tool.useCount} uses</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentlyUsed.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Recently Used</h3>
            <div className="space-y-2">
              {stats.recentlyUsed.map((tool) => (
                <div
                  key={`${tool.serverId}:${tool.toolName}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium text-sm">{tool.toolName}</p>
                    <p className="text-xs text-muted-foreground">{tool.serverName}</p>
                  </div>
                  {tool.lastUsed && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(tool.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
