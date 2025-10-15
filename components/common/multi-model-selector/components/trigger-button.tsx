/**
 * Trigger button for multi-model selector
 * Displays selected models with animated transitions
 */

import { Button } from "@/components/ui/button"
import { ModelConfig } from "@/lib/models/types"
import { PROVIDERS } from "@/lib/providers"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"

type ModelSelectorTriggerProps = {
  selectedModels: ModelConfig[]
  isLoadingModels: boolean
  className?: string
}

export function ModelSelectorTrigger({
  selectedModels,
  isLoadingModels,
  className,
}: ModelSelectorTriggerProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "dark:bg-secondary min-w-[200px] justify-between rounded-full",
        className
      )}
      disabled={isLoadingModels}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <AnimatePresence mode="popLayout">
          {selectedModels.length === 0 ? (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="text-muted-foreground"
            >
              Select models
            </motion.span>
          ) : selectedModels.length === 1 ? (
            <motion.div
              key="single-model"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {(() => {
                const provider = PROVIDERS.find(
                  (p) => p.id === selectedModels[0].icon
                )
                return provider?.icon ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <provider.icon className="size-5 flex-shrink-0" />
                  </motion.div>
                ) : null
              })()}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="truncate"
              >
                {selectedModels[0].name}
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="multiple-models"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex min-w-0 flex-1 items-center gap-1"
            >
              <div className="flex flex-shrink-0 -space-x-1">
                <AnimatePresence mode="popLayout">
                  {selectedModels.slice(0, 3).map((model, index) => {
                    const provider = PROVIDERS.find((p) => p.id === model.icon)
                    return provider?.icon ? (
                      <motion.div
                        key={`${model.id}`}
                        layout="position"
                        layoutId={`${model.id}`}
                        initial={{
                          scale: 0,
                          rotate: -180,
                          x: -20,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                          x: 0,
                          opacity: 1,
                        }}
                        exit={{
                          scale: 0,
                          rotate: 180,
                          x: 20,
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                          delay: index * 0.05,
                        }}
                        className="bg-background border-border flex size-5 items-center justify-center rounded-full border"
                        style={{ zIndex: 3 - index }}
                      >
                        <provider.icon className="size-3" />
                      </motion.div>
                    ) : null
                  })}
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedModels.length}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    className="inline-block"
                  >
                    {selectedModels.length}
                  </motion.span>
                </AnimatePresence>{" "}
                model{selectedModels.length > 1 ? "s" : ""} selected
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CaretDownIcon className="ml-2 size-4 flex-shrink-0 opacity-50" />
    </Button>
  )
}
