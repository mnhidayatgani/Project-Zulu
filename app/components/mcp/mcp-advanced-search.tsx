'use client'

import * as React from 'react'
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  History,
  Star,
  Bookmark,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
  type SearchFilter,
  loadSavedSearches,
  loadSearchHistory,
  saveSearch,
  deleteSavedSearch,
  useSavedSearch,
  getRecentSearches,
  getPopularSearches,
  addToSearchHistory,
  clearSearchHistory,
  type SavedSearch
} from '@/lib/mcp/search'

interface MCPAdvancedSearchProps {
  value: SearchFilter
  onChange: (filter: SearchFilter) => void
  availableProviders?: string[]
  availableCategories?: string[]
  availableTags?: string[]
  onSearch?: () => void
  resultCount?: number
  className?: string
}

/**
 * Advanced search component with filters
 */
export function MCPAdvancedSearch({
  value,
  onChange,
  availableProviders = [],
  availableCategories = [],
  availableTags = [],
  onSearch,
  resultCount,
  className
}: MCPAdvancedSearchProps) {
  const [showFilters, setShowFilters] = React.useState(false)
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [showHistory, setShowHistory] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load saved searches and history
  React.useEffect(() => {
    setSavedSearches(loadSavedSearches())
    setRecentSearches(getRecentSearches(10))
  }, [])

  const handleQueryChange = (query: string) => {
    onChange({ ...value, query })
    setShowSuggestions(query.length >= 2)
  }

  const handleSearch = () => {
    if (value.query) {
      addToSearchHistory(value.query, value, resultCount || 0)
      setRecentSearches(getRecentSearches(10))
    }
    onSearch?.()
    setShowSuggestions(false)
    setShowHistory(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setShowHistory(false)
    }
  }

  const handleUseSavedSearch = (search: SavedSearch) => {
    const updated = useSavedSearch(search.id)
    if (updated) {
      onChange(search.filter)
      setSavedSearches(loadSavedSearches())
    }
    setShowHistory(false)
  }

  const handleSaveCurrentSearch = () => {
    const name = prompt('Enter a name for this search:')
    if (name) {
      try {
        saveSearch(name, value)
        setSavedSearches(loadSavedSearches())
        alert('Search saved successfully!')
      } catch (error) {
        alert((error as Error).message)
      }
    }
  }

  const handleDeleteSavedSearch = (searchId: string) => {
    if (confirm('Delete this saved search?')) {
      deleteSavedSearch(searchId)
      setSavedSearches(loadSavedSearches())
    }
  }

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (value.providers && value.providers.length > 0) count++
    if (value.categories && value.categories.length > 0) count++
    if (value.tags && value.tags.length > 0) count++
    if (value.status && value.status !== 'all') count++
    if (value.hasInput !== undefined) count++
    if (value.hasOutput !== undefined) count++
    if (value.requiresAuth !== undefined) count++
    if (value.minRating !== undefined && value.minRating > 0) count++
    return count
  }, [value])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search MCP tools..."
            value={value.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowHistory(true)}
            className="pl-9 pr-24"
          />

          {value.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQueryChange('')}
              className="absolute right-16 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
          >
            Search
          </Button>

          {/* Search suggestions/history dropdown */}
          {(showHistory || showSuggestions) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-[300px] overflow-auto">
              {showHistory && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearSearchHistory()
                        setRecentSearches([])
                      }}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleQueryChange(query)
                        setShowHistory(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}

              {savedSearches.length > 0 && (
                <>
                  <Separator />
                  <div className="p-2">
                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      Saved Searches
                    </span>
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <button
                          onClick={() => handleUseSavedSearch(search)}
                          className="flex-1 text-left text-sm"
                        >
                          {search.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSavedSearch(search.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Save search button */}
        {value.query && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveCurrentSearch}
            title="Save this search"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.providers?.map((provider) => (
            <Badge key={provider} variant="secondary" className="gap-1">
              Provider: {provider}
              <button
                onClick={() => onChange({
                  ...value,
                  providers: value.providers?.filter(p => p !== provider)
                })}
                className="ml-1 hover:bg-background rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {value.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              Category: {category}
              <button
                onClick={() => onChange({
                  ...value,
                  categories: value.categories?.filter(c => c !== category)
                })}
                className="ml-1 hover:bg-background rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {value.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              Tag: {tag}
              <button
                onClick={() => onChange({
                  ...value,
                  tags: value.tags?.filter(t => t !== tag)
                })}
                className="ml-1 hover:bg-background rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ query: value.query })}
            className="h-6 text-xs"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Advanced filters panel */}
      {showFilters && (
        <MCPSearchFilters
          value={value}
          onChange={onChange}
          availableProviders={availableProviders}
          availableCategories={availableCategories}
          availableTags={availableTags}
        />
      )}

      {/* Results count */}
      {resultCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {resultCount} result{resultCount !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  )
}

interface MCPSearchFiltersProps {
  value: SearchFilter
  onChange: (filter: SearchFilter) => void
  availableProviders: string[]
  availableCategories: string[]
  availableTags: string[]
}

function MCPSearchFilters({
  value,
  onChange,
  availableProviders,
  availableCategories,
  availableTags
}: MCPSearchFiltersProps) {
  return (
    <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Providers */}
        {availableProviders.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Providers</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {availableProviders.map((provider) => (
                <div key={provider} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`provider-${provider}`}
                    checked={value.providers?.includes(provider)}
                    onCheckedChange={(checked) => {
                      const current = value.providers || []
                      onChange({
                        ...value,
                        providers: checked
                          ? [...current, provider]
                          : current.filter(p => p !== provider)
                      })
                    }}
                  />
                  <label
                    htmlFor={`provider-${provider}`}
                    className="text-sm cursor-pointer"
                  >
                    {provider}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Categories</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`category-${category}`}
                    checked={value.categories?.includes(category)}
                    onCheckedChange={(checked) => {
                      const current = value.categories || []
                      onChange({
                        ...value,
                        categories: checked
                          ? [...current, category]
                          : current.filter(c => c !== category)
                      })
                    }}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tags</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={value.tags?.includes(tag)}
                    onCheckedChange={(checked) => {
                      const current = value.tags || []
                      onChange({
                        ...value,
                        tags: checked
                          ? [...current, tag]
                          : current.filter(t => t !== tag)
                      })
                    }}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Status</Label>
          <Select
            value={value.status || 'all'}
            onValueChange={(v) => onChange({ ...value, status: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum rating */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Min Rating: {value.minRating?.toFixed(1) || '0.0'}
          </Label>
          <Slider
            value={[value.minRating || 0]}
            onValueChange={(v) => onChange({ ...value, minRating: v[0] })}
            min={0}
            max={5}
            step={0.5}
            className="pt-2"
          />
        </div>

        {/* Sort by */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Sort By</Label>
          <Select
            value={value.sortBy || 'relevance'}
            onValueChange={(v) => onChange({ ...value, sortBy: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort order */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Order</Label>
          <Select
            value={value.sortOrder || 'desc'}
            onValueChange={(v) => onChange({ ...value, sortOrder: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-input"
            checked={value.hasInput}
            onCheckedChange={(checked) => onChange({
              ...value,
              hasInput: checked ? true : undefined
            })}
          />
          <label htmlFor="has-input" className="text-sm cursor-pointer">
            Has Input Schema
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-output"
            checked={value.hasOutput}
            onCheckedChange={(checked) => onChange({
              ...value,
              hasOutput: checked ? true : undefined
            })}
          />
          <label htmlFor="has-output" className="text-sm cursor-pointer">
            Has Output Schema
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires-auth"
            checked={value.requiresAuth}
            onCheckedChange={(checked) => onChange({
              ...value,
              requiresAuth: checked ? true : undefined
            })}
          />
          <label htmlFor="requires-auth" className="text-sm cursor-pointer">
            Requires Authentication
          </label>
        </div>
      </div>
    </div>
  )
}
