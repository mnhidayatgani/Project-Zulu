import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * useToggle Hook
 * Manages boolean state with toggle function
 * 
 * @param initialValue - initial boolean value
 * @returns [value, toggle, setValue]
 * 
 * @example
 * const [isOpen, toggle, setIsOpen] = useToggle(false)
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}

/**
 * useCounter Hook
 * Manages counter state with increment/decrement
 * 
 * @param initialValue - initial count value
 * @param options - min/max constraints
 * @returns counter state and methods
 * 
 * @example
 * const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 10 })
 */
export function useCounter(
  initialValue = 0,
  options?: { min?: number; max?: number }
) {
  const { min, max } = options || {}
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((c) => {
      const next = c + 1
      if (max !== undefined && next > max) return c
      return next
    })
  }, [max])

  const decrement = useCallback(() => {
    setCount((c) => {
      const next = c - 1
      if (min !== undefined && next < min) return c
      return next
    })
  }, [min])

  const reset = useCallback(() => setCount(initialValue), [initialValue])

  const set = useCallback(
    (value: number) => {
      setCount((c) => {
        if (min !== undefined && value < min) return c
        if (max !== undefined && value > max) return c
        return value
      })
    },
    [min, max]
  )

  return { count, increment, decrement, reset, set }
}

/**
 * useArray Hook
 * Manages array state with helper methods
 * 
 * @param initialValue - initial array
 * @returns array state and methods
 * 
 * @example
 * const { value, push, remove, clear } = useArray([1, 2, 3])
 */
export function useArray<T>(initialValue: T[] = []) {
  const [value, setValue] = useState(initialValue)

  const push = useCallback((item: T) => {
    setValue((arr) => [...arr, item])
  }, [])

  const remove = useCallback((index: number) => {
    setValue((arr) => arr.filter((_, i) => i !== index))
  }, [])

  const filter = useCallback((callback: (item: T) => boolean) => {
    setValue((arr) => arr.filter(callback))
  }, [])

  const update = useCallback((index: number, newItem: T) => {
    setValue((arr) => arr.map((item, i) => (i === index ? newItem : item)))
  }, [])

  const clear = useCallback(() => setValue([]), [])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return { value, setValue, push, remove, filter, update, clear, reset }
}

/**
 * usePrevious Hook
 * Tracks previous value of a variable
 * 
 * @param value - current value
 * @returns previous value
 * 
 * @example
 * const prevCount = usePrevious(count)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * useUpdateEffect Hook
 * useEffect that skips the initial mount
 * 
 * @param effect - effect function
 * @param deps - dependency array
 * 
 * @example
 * useUpdateEffect(() => {
 *   console.log('Updated, but not on mount')
 * }, [dependency])
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      return effect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * useIsMounted Hook
 * Tracks if component is mounted
 * 
 * @returns function that returns mounted state
 * 
 * @example
 * const isMounted = useIsMounted()
 * // Later: if (isMounted()) { ... }
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

/**
 * useTimeout Hook
 * Executes callback after delay
 * 
 * @param callback - function to execute
 * @param delay - delay in milliseconds
 * 
 * @example
 * useTimeout(() => console.log('Executed after 1s'), 1000)
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setTimeout(() => savedCallback.current(), delay)
    return () => clearTimeout(id)
  }, [delay])
}

/**
 * useInterval Hook
 * Executes callback at interval
 * 
 * @param callback - function to execute
 * @param delay - interval in milliseconds
 * 
 * @example
 * useInterval(() => console.log('Every second'), 1000)
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

/**
 * useCopyToClipboard Hook
 * Copies text to clipboard
 * 
 * @returns [copiedText, copy function]
 * 
 * @example
 * const [copiedText, copy] = useCopyToClipboard()
 * copy('Text to copy')
 */
export function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<void>
] {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
    }
  }, [])

  return [copiedText, copy]
}
