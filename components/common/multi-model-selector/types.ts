/**
 * Shared types for multi-model selector
 */

export type MultiModelSelectorProps = {
  selectedModelIds: string[]
  setSelectedModelIds: (modelIds: string[]) => void
  className?: string
  isUserAuthenticated?: boolean
  maxModels?: number
}

export type ModelToggleHandler = (modelId: string, isLocked: boolean) => void

export type ModelSelectorState = {
  hoveredModel: string | null
  setHoveredModel: (model: string | null) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
  isProDialogOpen: boolean
  setIsProDialogOpen: (open: boolean) => void
  selectedProModel: string | null
  setSelectedProModel: (model: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}
