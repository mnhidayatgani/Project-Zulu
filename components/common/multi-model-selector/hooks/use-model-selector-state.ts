/**
 * Custom hook for multi-model selector state management
 */

import { useState } from "react"
import type { ModelSelectorState } from "../types"

export function useModelSelectorState(): ModelSelectorState {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProDialogOpen, setIsProDialogOpen] = useState(false)
  const [selectedProModel, setSelectedProModel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  return {
    hoveredModel,
    setHoveredModel,
    isDrawerOpen,
    setIsDrawerOpen,
    isDropdownOpen,
    setIsDropdownOpen,
    isProDialogOpen,
    setIsProDialogOpen,
    selectedProModel,
    setSelectedProModel,
    searchQuery,
    setSearchQuery,
  }
}
