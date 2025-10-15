/**
 * Individual model item component
 * Displays a single model with checkbox and lock status
 */

import { Checkbox } from "@/components/ui/checkbox"
import { ModelConfig } from "@/lib/models/types"
import { PROVIDERS } from "@/lib/providers"
import { cn } from "@/lib/utils"
import { StarIcon } from "@phosphor-icons/react"

type ModelItemProps = {
  model: ModelConfig
  isSelected: boolean
  isAtLimit: boolean
  onToggle: (modelId: string, isLocked: boolean) => void
}

export function ModelItem({
  model,
  isSelected,
  isAtLimit,
  onToggle,
}: ModelItemProps) {
  const isLocked = !model.accessible
  const provider = PROVIDERS.find((provider) => provider.id === model.icon)

  return (
    <div
      className={cn(
        "hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between px-3 py-2",
        isSelected && "bg-accent"
      )}
      onClick={() => onToggle(model.id, isLocked)}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          disabled={isLocked || (!isSelected && isAtLimit)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggle(model.id, isLocked)}
        />
        {provider?.icon && <provider.icon className="size-5" />}
        <div className="flex flex-col gap-0">
          <span className="text-sm">{model.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLocked && (
          <div className="border-input bg-accent text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
            <StarIcon className="size-2" />
            <span>Locked</span>
          </div>
        )}
        {!isSelected && isAtLimit && !isLocked && (
          <div className="border-input bg-muted text-muted-foreground flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
            <span>Limit</span>
          </div>
        )}
      </div>
    </div>
  )
}
