"use client"

import { PopoverContentAuth } from "@/app/components/chat-input/popover-content-auth"
import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModel } from "@/lib/model-store/provider"
import { filterAndSortModels } from "@/lib/model-store/utils"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"
import { useRef } from "react"
import { ProModelDialog } from "../model-selector/pro-dialog"
import { SubMenu } from "../model-selector/sub-menu"
import {
  ModelSelectorTrigger,
  ModelSearchInput,
  ModelList,
} from "./components"
import { useModelSelectorState } from "./hooks/use-model-selector-state"
import type { MultiModelSelectorProps } from "./types"

export function MultiModelSelector({
  selectedModelIds,
  setSelectedModelIds,
  className,
  isUserAuthenticated = true,
  maxModels = 5,
}: MultiModelSelectorProps) {
  const { models, isLoading: isLoadingModels, favoriteModels } = useModel()
  const { isModelHidden } = useUserPreferences()

  const selectedModels = models.filter((model) =>
    selectedModelIds.includes(model.id)
  )
  const isMobile = useBreakpoint(768)

  // Use custom hook for state management
  const {
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
  } = useModelSelectorState()

  const searchInputRef = useRef<HTMLInputElement>(null)

  useKeyShortcut(
    (e) => (e.key === "m" || e.key === "M") && e.metaKey && e.shiftKey,
    () => {
      if (isMobile) {
        setIsDrawerOpen(!isDrawerOpen)
      } else {
        setIsDropdownOpen(!isDropdownOpen)
      }
    }
  )

  const handleModelToggle = (modelId: string, isLocked: boolean) => {
    if (isLocked) {
      setSelectedProModel(modelId)
      setIsProDialogOpen(true)
      return
    }

    const isSelected = selectedModelIds.includes(modelId)

    if (isSelected) {
      setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId))
    } else {
      if (selectedModelIds.length < maxModels) {
        setSelectedModelIds([...selectedModelIds, modelId])
      }
    }
  }

  // Get the hovered model data
  const hoveredModelData = models.find((model) => model.id === hoveredModel)

  const filteredModels = filterAndSortModels(
    models,
    favoriteModels || [],
    searchQuery,
    isModelHidden
  )

  if (isLoadingModels) {
    return null
  }

  // Create trigger button
  const trigger = (
    <ModelSelectorTrigger
      selectedModels={selectedModels}
      isLoadingModels={isLoadingModels}
      className={className}
    />
  )

  // Handle input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSearchQuery(e.target.value)
  }

  // If user is not authenticated, show the auth popover
  if (!isUserAuthenticated) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  "border-border dark:bg-secondary text-accent-foreground h-9 w-auto border bg-transparent",
                  className
                )}
                type="button"
              >
                <span>Select models</span>
                <CaretDownIcon className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Select models</TooltipContent>
        </Tooltip>
        <PopoverContentAuth />
      </Popover>
    )
  }

  if (isMobile) {
    return (
      <div>
        <ProModelDialog
          isOpen={isProDialogOpen}
          setIsOpen={setIsProDialogOpen}
          currentModel={selectedProModel || ""}
        />
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Select Models ({selectedModelIds.length}/{maxModels})
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <ModelSearchInput
                searchQuery={searchQuery}
                onChange={handleSearchChange}
                inputRef={searchInputRef}
              />
            </div>
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-4 pb-6">
              <ModelList
                models={filteredModels}
                selectedModelIds={selectedModelIds}
                maxModels={maxModels}
                isLoading={isLoadingModels}
                onModelToggle={handleModelToggle}
              />
              {filteredModels.length === 0 && !isLoadingModels && (
                <div className="pt-4 text-center">
                  <a
                    href="https://github.com/ibelick/zola/issues/new?title=Model%20Request%3A%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground text-sm underline"
                  >
                    Request a new model
                  </a>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  return (
    <div>
      <ProModelDialog
        isOpen={isProDialogOpen}
        setIsOpen={setIsProDialogOpen}
        currentModel={selectedProModel || ""}
      />
      <Tooltip>
        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={(open) => {
            setIsDropdownOpen(open)
            if (!open) {
              setHoveredModel(null)
              setSearchQuery("")
            } else {
              if (selectedModelIds.length > 0)
                setHoveredModel(selectedModelIds[0])
            }
          }}
        >
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Select models ⌘⇧M ({selectedModelIds.length}/{maxModels})
          </TooltipContent>
          <DropdownMenuContent
            className="flex h-[320px] w-[300px] flex-col space-y-0.5 overflow-visible p-0"
            align="start"
            sideOffset={4}
            forceMount
            side="top"
          >
            <ModelSearchInput
              searchQuery={searchQuery}
              onChange={handleSearchChange}
              inputRef={searchInputRef}
              placeholder="Search models..."
            />
            <div className="flex h-full flex-col space-y-0 overflow-y-auto px-1 pt-0 pb-0">
              <ModelList
                models={filteredModels}
                selectedModelIds={selectedModelIds}
                maxModels={maxModels}
                isLoading={isLoadingModels}
                onModelToggle={handleModelToggle}
              />
            </div>

            {/* Submenu positioned absolutely */}
            {hoveredModelData && (
              <div className="absolute top-0 left-[calc(100%+8px)]">
                <SubMenu hoveredModelData={hoveredModelData} />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </div>
  )
}
