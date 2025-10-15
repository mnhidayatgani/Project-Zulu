/**
 * Search input for filtering models
 */

import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Ref, RefObject } from "react"

type ModelSearchInputProps = {
  searchQuery: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: RefObject<HTMLInputElement | null> | Ref<HTMLInputElement>
  placeholder?: string
}

export function ModelSearchInput({
  searchQuery,
  onChange,
  inputRef,
  placeholder = "Search models...",
}: ModelSearchInputProps) {
  return (
    <div className="bg-background sticky top-0 z-10 rounded-t-md border-b px-0 pt-0 pb-0">
      <div className="relative">
        <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="dark:bg-popover rounded-b-none border border-none pl-8 shadow-none focus-visible:ring-0"
          value={searchQuery}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}
