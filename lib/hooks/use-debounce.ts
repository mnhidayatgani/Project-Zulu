import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useDebounce Hook
 * Debounces a value by delaying updates until after specified delay
 * 
 * @param value - value to debounce
 * @param delay - delay in milliseconds
 * @returns debounced value
 * 
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useDebouncedCallback Hook
 * Creates a debounced version of a callback function
 * 
 * @param callback - function to debounce
 * @param delay - delay in milliseconds
 * @returns debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((term) => search(term), 500)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * useThrottle Hook
 * Throttles a value by limiting updates to once per specified interval
 * 
 * @param value - value to throttle
 * @param interval - interval in milliseconds
 * @returns throttled value
 * 
 * @example
 * const throttledScrollPos = useThrottle(scrollPosition, 100)
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdated.current

    if (timeSinceLastUpdate >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timeoutId = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - timeSinceLastUpdate)

      return () => clearTimeout(timeoutId)
    }
  }, [value, interval])

  return throttledValue
}
