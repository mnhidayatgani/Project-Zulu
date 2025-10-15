# Custom React Hooks Library

A comprehensive collection of reusable React hooks for common patterns and functionality.

## 📦 Installation

```typescript
import { useLocalStorage, useDebounce, useMediaQuery } from '@/lib/hooks'
```

## 🎯 Hook Categories

### Storage Hooks

#### `useLocalStorage<T>`
Persists state to localStorage with SSR support.

```typescript
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark')
```

#### `useSessionStorage<T>`
Similar to useLocalStorage but uses sessionStorage (cleared on tab close).

```typescript
const [tempData, setTempData] = useSessionStorage('temp', null)
```

---

### Timing Hooks

#### `useDebounce<T>`
Debounces a value by delaying updates.

```typescript
const debouncedSearchTerm = useDebounce(searchTerm, 500)
```

#### `useDebouncedCallback`
Creates a debounced version of a callback.

```typescript
const debouncedSearch = useDebouncedCallback((term) => search(term), 500)
```

#### `useThrottle<T>`
Throttles a value by limiting updates.

```typescript
const throttledScrollPos = useThrottle(scrollPosition, 100)
```

#### `useTimeout`
Executes callback after delay.

```typescript
useTimeout(() => console.log('After 1 second'), 1000)
```

#### `useInterval`
Executes callback at interval.

```typescript
useInterval(() => console.log('Every second'), 1000)
```

---

### Responsive Hooks

#### `useMediaQuery`
Tracks whether a media query matches.

```typescript
const isMobile = useMediaQuery('(max-width: 768px)')
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
```

#### `useBreakpoint`
Checks if viewport is below a breakpoint.

```typescript
const isMobile = useBreakpoint(768)
```

#### `useIsMobile`, `useIsTablet`, `useIsDesktop`
Pre-configured breakpoint hooks.

```typescript
const isMobile = useIsMobile()   // < 768px
const isTablet = useIsTablet()   // 768px - 1024px
const isDesktop = useIsDesktop() // >= 1024px
```

#### `usePrefersDarkMode`
Checks if user prefers dark color scheme.

```typescript
const prefersDark = usePrefersDarkMode()
```

#### `useResponsiveValue`
Returns different values based on breakpoint.

```typescript
const columns = useResponsiveValue({ xs: 1, md: 2, lg: 3 })
```

---

### Async Hooks

#### `useAsync`
Manages async operation state (loading, error, data).

```typescript
const { data, isLoading, error, execute } = useAsync(fetchUser, false)
// Later: execute(userId)
```

#### `useFetch`
Simplified fetch wrapper with automatic execution.

```typescript
const { data, isLoading, error } = useFetch('/api/users')
```

#### `useAsyncCallback`
Creates an async callback with loading state.

```typescript
const [saveData, isSaving, saveError] = useAsyncCallback(async (data) => {
  await api.save(data)
})
```

#### `useAsyncEffect`
useEffect with async function support.

```typescript
useAsyncEffect(async () => {
  const data = await fetchData()
  setData(data)
}, [])
```

---

### DOM Hooks

#### `useEventListener`
Adds event listener with automatic cleanup.

```typescript
useEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})
```

#### `useOnClickOutside`
Detects clicks outside of specified element.

```typescript
const ref = useRef()
useOnClickOutside(ref, () => setIsOpen(false))
```

#### `useKeyPress`
Detects if specific key is pressed.

```typescript
const escapePressed = useKeyPress('Escape')
```

#### `useWindowSize`
Tracks window dimensions.

```typescript
const { width, height } = useWindowSize()
```

#### `useWindowScroll`
Tracks window scroll position.

```typescript
const { x, y } = useWindowScroll()
```

#### `useHover`
Detects hover state of an element.

```typescript
const ref = useRef()
const isHovered = useHover(ref)
```

#### `useIntersectionObserver`
Detects if element is in viewport.

```typescript
const ref = useRef()
const entry = useIntersectionObserver(ref, { threshold: 0.5 })
const isVisible = entry?.isIntersecting
```

---

### State Helper Hooks

#### `useToggle`
Manages boolean state with toggle function.

```typescript
const [isOpen, toggle, setIsOpen] = useToggle(false)
```

#### `useCounter`
Manages counter state with increment/decrement.

```typescript
const { count, increment, decrement, reset } = useCounter(0, { 
  min: 0, 
  max: 10 
})
```

#### `useArray`
Manages array state with helper methods.

```typescript
const { value, push, remove, filter, clear } = useArray([1, 2, 3])
```

#### `usePrevious`
Tracks previous value of a variable.

```typescript
const prevCount = usePrevious(count)
```

#### `useUpdateEffect`
useEffect that skips the initial mount.

```typescript
useUpdateEffect(() => {
  console.log('Updated, but not on mount')
}, [dependency])
```

#### `useIsMounted`
Tracks if component is mounted.

```typescript
const isMounted = useIsMounted()
// Later: if (isMounted()) { setState(...) }
```

#### `useCopyToClipboard`
Copies text to clipboard.

```typescript
const [copiedText, copy] = useCopyToClipboard()
copy('Text to copy')
```

---

## 🎨 Usage Examples

### Form with debounced search

```typescript
function SearchForm() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  
  const { data, isLoading } = useFetch(`/api/search?q=${debouncedSearch}`)
  
  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
      />
      {isLoading && <Spinner />}
      {data && <Results data={data} />}
    </div>
  )
}
```

### Responsive layout

```typescript
function ResponsiveGrid() {
  const columns = useResponsiveValue({
    xs: 1,
    md: 2,
    lg: 3,
    xl: 4
  })
  
  return (
    <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map(item => <Card key={item.id} {...item} />)}
    </div>
  )
}
```

### Modal with outside click

```typescript
function Modal({ onClose }) {
  const modalRef = useRef()
  const escPressed = useKeyPress('Escape')
  
  useOnClickOutside(modalRef, onClose)
  
  useEffect(() => {
    if (escPressed) onClose()
  }, [escPressed, onClose])
  
  return <div ref={modalRef}>Modal content</div>
}
```

### Persistent theme

```typescript
function ThemeProvider() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const prefersDark = usePrefersDarkMode()
  
  useEffect(() => {
    if (!theme) {
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [prefersDark, theme, setTheme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## 🧪 Testing

All hooks are designed to be testable with React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '@/lib/hooks'

test('useToggle', () => {
  const { result } = renderHook(() => useToggle(false))
  
  expect(result.current[0]).toBe(false)
  
  act(() => {
    result.current[1]() // toggle
  })
  
  expect(result.current[0]).toBe(true)
})
```

---

## 📝 Best Practices

1. **Always provide initial values** to avoid undefined states
2. **Use TypeScript generics** for type safety
3. **Clean up effects** - all hooks handle cleanup automatically
4. **SSR-safe** - hooks check for window/document availability
5. **Memoization** - callbacks are memoized with useCallback
6. **Dependency arrays** - follow React's rules of hooks

---

## 🤝 Contributing

When adding new hooks:

1. Add proper TypeScript types
2. Include JSDoc comments with examples
3. Handle SSR gracefully
4. Add cleanup for side effects
5. Export from index.ts
6. Update this README

---

## 📚 Hook Count

**Total: 30+ hooks** organized in 6 categories:
- Storage: 2 hooks
- Timing: 5 hooks
- Responsive: 8 hooks
- Async: 4 hooks
- DOM: 7 hooks
- State: 10 hooks
