/**
 * List of models with empty/loading states
 */

import { ModelConfig } from "@/lib/models/types"
import { ModelItem } from "./model-item"

type ModelListProps = {
  models: ModelConfig[]
  selectedModelIds: string[]
  maxModels: number
  isLoading: boolean
  onModelToggle: (modelId: string, isLocked: boolean) => void
}

export function ModelList({
  models,
  selectedModelIds,
  maxModels,
  isLoading,
  onModelToggle,
}: ModelListProps) {
  const isAtLimit = selectedModelIds.length >= maxModels

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-2 text-sm">Loading models...</p>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-2 text-sm">
          No models found matching your search.
        </p>
      </div>
    )
  }

  return (
    <>
      {models.map((model) => (
        <ModelItem
          key={model.id}
          model={model}
          isSelected={selectedModelIds.includes(model.id)}
          isAtLimit={isAtLimit}
          onToggle={onModelToggle}
        />
      ))}
    </>
  )
}
