/**
 * Custom React Hooks Library
 * Centralized exports for all custom hooks
 * 
 * Usage:
 * import { useLocalStorage, useDebounce, useMediaQuery } from '@/lib/hooks'
 */

// Storage hooks
export * from './use-storage'

// Debounce/Throttle hooks
export * from './use-debounce'

// Media query and responsive hooks
export * from './use-media-query'

// Async operation hooks
export * from './use-async'

// DOM event hooks
export * from './use-dom'

// State helper hooks
export * from './use-state-helpers'

// Re-export existing hooks for convenience
export { useChatPreview } from './use-chat-preview'

/**
 * Hook Categories
 * 
 * Storage:
 * - useLocalStorage: Persist state to localStorage
 * - useSessionStorage: Persist state to sessionStorage
 * 
 * Timing:
 * - useDebounce: Debounce a value
 * - useDebouncedCallback: Debounce a callback
 * - useThrottle: Throttle a value
 * - useTimeout: Execute after delay
 * - useInterval: Execute at interval
 * 
 * Responsive:
 * - useMediaQuery: Match media queries
 * - useBreakpoint: Check breakpoint
 * - useIsMobile: Detect mobile
 * - useIsTablet: Detect tablet
 * - useIsDesktop: Detect desktop
 * - usePrefersDarkMode: Dark mode preference
 * - usePrefersReducedMotion: Motion preference
 * - useResponsiveValue: Responsive values
 * 
 * Async:
 * - useAsync: Manage async operations
 * - useFetch: Fetch data
 * - useAsyncCallback: Async callback with state
 * - useAsyncEffect: Async useEffect
 * 
 * DOM:
 * - useEventListener: Add event listener
 * - useOnClickOutside: Detect outside clicks
 * - useKeyPress: Detect key press
 * - useWindowSize: Track window size
 * - useWindowScroll: Track scroll position
 * - useHover: Detect hover state
 * - useIntersectionObserver: Intersection observer
 * 
 * State:
 * - useToggle: Toggle boolean state
 * - useCounter: Counter with constraints
 * - useArray: Array state with helpers
 * - usePrevious: Track previous value
 * - useUpdateEffect: Effect without initial mount
 * - useIsMounted: Check if mounted
 * - useCopyToClipboard: Copy to clipboard
 */
