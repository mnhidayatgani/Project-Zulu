import { useState, useEffect } from 'react'

/**
 * useMediaQuery Hook
 * Tracks whether a media query matches
 * 
 * @param query - media query string
 * @returns boolean indicating if query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handler)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}

/**
 * useBreakpoint Hook
 * Checks if viewport is below a breakpoint
 * 
 * @param breakpoint - breakpoint in pixels
 * @returns boolean indicating if viewport is below breakpoint
 * 
 * @example
 * const isMobile = useBreakpoint(768)
 */
export function useBreakpoint(breakpoint: number): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`)
}

/**
 * useIsMobile Hook
 * Checks if device is mobile (< 768px)
 * 
 * @returns boolean indicating if mobile
 */
export function useIsMobile(): boolean {
  return useBreakpoint(768)
}

/**
 * useIsTablet Hook
 * Checks if device is tablet (768px - 1024px)
 * 
 * @returns boolean indicating if tablet
 */
export function useIsTablet(): boolean {
  const isAboveMobile = !useBreakpoint(768)
  const isBelowDesktop = useBreakpoint(1024)
  return isAboveMobile && isBelowDesktop
}

/**
 * useIsDesktop Hook
 * Checks if device is desktop (>= 1024px)
 * 
 * @returns boolean indicating if desktop
 */
export function useIsDesktop(): boolean {
  return !useBreakpoint(1024)
}

/**
 * usePrefersDarkMode Hook
 * Checks if user prefers dark color scheme
 * 
 * @returns boolean indicating dark mode preference
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/**
 * usePrefersReducedMotion Hook
 * Checks if user prefers reduced motion
 * 
 * @returns boolean indicating reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Breakpoint values for common devices
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * useResponsiveValue Hook
 * Returns different values based on breakpoint
 * 
 * @param values - object with breakpoint keys
 * @returns value for current breakpoint
 * 
 * @example
 * const columns = useResponsiveValue({ xs: 1, md: 2, lg: 3 })
 */
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}): T | undefined {
  const is2xl = !useBreakpoint(BREAKPOINTS['2xl'])
  const isXl = !useBreakpoint(BREAKPOINTS.xl)
  const isLg = !useBreakpoint(BREAKPOINTS.lg)
  const isMd = !useBreakpoint(BREAKPOINTS.md)
  const isSm = !useBreakpoint(BREAKPOINTS.sm)

  if (is2xl && values['2xl']) return values['2xl']
  if (isXl && values.xl) return values.xl
  if (isLg && values.lg) return values.lg
  if (isMd && values.md) return values.md
  if (isSm && values.sm) return values.sm
  return values.xs
}
