import { useState, useEffect, useCallback, RefObject } from 'react'

/**
 * useEventListener Hook
 * Adds event listener with automatic cleanup
 * 
 * @param eventName - name of the event
 * @param handler - event handler function
 * @param element - element to attach to (default: window)
 * 
 * @example
 * useEventListener('keydown', (e) => console.log(e.key))
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Document | HTMLElement = window
) {
  useEffect(() => {
    if (!element || !element.addEventListener) return

    const eventListener = (event: Event) => {
      handler(event as WindowEventMap[K])
    }

    element.addEventListener(eventName as string, eventListener)

    return () => {
      element.removeEventListener(eventName as string, eventListener)
    }
  }, [eventName, handler, element])
}

/**
 * useOnClickOutside Hook
 * Detects clicks outside of specified element
 * 
 * @param ref - ref to element
 * @param handler - callback when clicked outside
 * 
 * @example
 * const ref = useRef()
 * useOnClickOutside(ref, () => setIsOpen(false))
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * useKeyPress Hook
 * Detects if specific key is pressed
 * 
 * @param targetKey - key to detect
 * @returns boolean indicating if key is pressed
 * 
 * @example
 * const escapePressed = useKeyPress('Escape')
 */
export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false)

  const downHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true)
      }
    },
    [targetKey]
  )

  const upHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false)
      }
    },
    [targetKey]
  )

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [downHandler, upHandler])

  return keyPressed
}

/**
 * useWindowSize Hook
 * Tracks window dimensions
 * 
 * @returns { width, height }
 * 
 * @example
 * const { width, height } = useWindowSize()
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * useWindowScroll Hook
 * Tracks window scroll position
 * 
 * @returns { x, y }
 * 
 * @example
 * const { x, y } = useWindowScroll()
 */
export function useWindowScroll() {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.scrollX : 0,
    y: typeof window !== 'undefined' ? window.scrollY : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}

/**
 * useHover Hook
 * Detects hover state of an element
 * 
 * @param ref - ref to element
 * @returns boolean indicating hover state
 * 
 * @example
 * const ref = useRef()
 * const isHovered = useHover(ref)
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): boolean {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  useEffect(() => {
    const node = ref.current
    if (!node) return

    node.addEventListener('mouseenter', handleMouseEnter)
    node.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter)
      node.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, handleMouseEnter, handleMouseLeave])

  return isHovered
}

/**
 * useIntersectionObserver Hook
 * Detects if element is in viewport
 * 
 * @param ref - ref to element
 * @param options - IntersectionObserver options
 * @returns IntersectionObserverEntry or undefined
 * 
 * @example
 * const ref = useRef()
 * const entry = useIntersectionObserver(ref, { threshold: 0.5 })
 * const isVisible = entry?.isIntersecting
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, options)

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return entry
}
