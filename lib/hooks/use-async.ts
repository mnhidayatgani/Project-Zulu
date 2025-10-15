import { useState, useEffect, useCallback } from 'react'

/**
 * Async state for tracking async operations
 */
export type AsyncState<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

/**
 * useAsync Hook
 * Manages async operation state (loading, error, data)
 * 
 * @param asyncFunction - async function to execute
 * @param immediate - whether to execute immediately
 * @returns async state and execute function
 * 
 * @example
 * const { data, isLoading, error, execute } = useAsync(fetchUser, false)
 * // Later: execute(userId)
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isError: false,
    isSuccess: false,
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
      })

      try {
        const response = await asyncFunction(...args)
        setState({
          data: response,
          error: null,
          isLoading: false,
          isError: false,
          isSuccess: true,
        })
        return response
      } catch (error) {
        setState({
          data: null,
          error: error as Error,
          isLoading: false,
          isError: true,
          isSuccess: false,
        })
        throw error
      }
    },
    [asyncFunction]
  )

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args))
    }
  }, [execute, immediate])

  return { ...state, execute }
}

/**
 * useFetch Hook
 * Simplified fetch wrapper with automatic execution
 * 
 * @param url - URL to fetch
 * @param options - fetch options
 * @returns fetch state
 * 
 * @example
 * const { data, isLoading, error } = useFetch('/api/users')
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  const fetchData = useCallback(async () => {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<T>
  }, [url, options])

  return useAsync<T>(fetchData, true)
}

/**
 * useAsyncCallback Hook
 * Creates an async callback with loading state
 * 
 * @param callback - async callback function
 * @returns [execute, loading, error]
 * 
 * @example
 * const [saveData, isSaving, saveError] = useAsyncCallback(async (data) => {
 *   await api.save(data)
 * })
 */
export function useAsyncCallback<T, Args extends any[] = []>(
  callback: (...args: Args) => Promise<T>
): [(...args: Args) => Promise<T | undefined>, boolean, Error | null] {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await callback(...args)
        setIsLoading(false)
        return result
      } catch (err) {
        const error = err as Error
        setError(error)
        setIsLoading(false)
        throw error
      }
    },
    [callback]
  )

  return [execute, isLoading, error]
}

/**
 * useAsyncEffect Hook
 * useEffect with async function support
 * 
 * @param effect - async effect function
 * @param deps - dependency array
 * 
 * @example
 * useAsyncEffect(async () => {
 *   const data = await fetchData()
 *   setData(data)
 * }, [])
 */
export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps?: React.DependencyList
) {
  useEffect(() => {
    let cleanup: void | (() => void)
    let cancelled = false

    const execute = async () => {
      cleanup = await effect()
      if (cancelled && cleanup) {
        cleanup()
      }
    }

    execute()

    return () => {
      cancelled = true
      if (cleanup) {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
