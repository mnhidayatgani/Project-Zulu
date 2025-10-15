# Testing Patterns & Best Practices

**Project**: Zola  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This document outlines common testing patterns, best practices, and anti-patterns for the Zola project. Use these patterns as templates for writing consistent, maintainable tests.

---

## 🎯 Core Testing Patterns

### 1. AAA Pattern (Arrange, Act, Assert)

The AAA pattern is the fundamental structure for all tests:

```typescript
it('should do something', () => {
  // Arrange - Set up test data and state
  const input = 'test'
  const expected = 'TEST'
  
  // Act - Execute the code under test
  const result = transform(input)
  
  // Assert - Verify the outcome
  expect(result).toBe(expected)
})
```

**Why**: Clear separation of concerns makes tests easy to read and maintain.

### 2. Single Responsibility Pattern

Each test should verify one specific behavior:

```typescript
// ✅ Good - Single responsibility
describe('UserValidator', () => {
  it('should validate email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })
  
  it('should reject invalid email format', () => {
    expect(isValidEmail('invalid')).toBe(false)
  })
  
  it('should reject empty email', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

// ❌ Bad - Testing multiple things
it('should validate user input', () => {
  expect(isValidEmail('test@example.com')).toBe(true)
  expect(isValidEmail('invalid')).toBe(false)
  expect(isValidPassword('Password123!')).toBe(true)
})
```

### 3. Test Data Builder Pattern

Use factories to create test data:

```typescript
// __tests__/utils/factories.ts
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockChat(overrides = {}) {
  return {
    id: 'chat-123',
    title: 'Test Chat',
    model: 'gpt-4o',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// In tests
it('should handle premium users', () => {
  const user = createMockUser({ premium: true })
  expect(isPremiumUser(user)).toBe(true)
})
```

### 4. Setup and Teardown Pattern

Use beforeEach/afterEach for common setup:

```typescript
describe('ChatStore', () => {
  let store: ChatStore
  
  beforeEach(() => {
    store = createChatStore()
    // Reset any global state
    localStorage.clear()
  })
  
  afterEach(() => {
    // Clean up
    store.destroy()
    jest.clearAllMocks()
  })
  
  it('should add chat', () => {
    store.addChat(mockChat)
    expect(store.chats).toHaveLength(1)
  })
})
```

---

## 🧪 Component Testing Patterns

### 1. Render and Query Pattern

```typescript
import { render, screen } from '@testing-library/react'

it('should render component correctly', () => {
  // Render
  render(<MessageItem message={mockMessage} />)
  
  // Query
  const messageText = screen.getByText(mockMessage.content)
  const timestamp = screen.getByText(/just now/i)
  
  // Assert
  expect(messageText).toBeInTheDocument()
  expect(timestamp).toBeInTheDocument()
})
```

### 2. User Interaction Pattern

```typescript
import userEvent from '@testing-library/user-event'

it('should handle user interaction', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### 3. Async Component Pattern

```typescript
import { waitFor, screen } from '@testing-library/react'

it('should load data asynchronously', async () => {
  mockFetch({ data: mockChats })
  
  render(<ChatList />)
  
  // Initially loading
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(mockChats[0].title)).toBeInTheDocument()
  })
  
  // Loading indicator gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

### 4. Form Testing Pattern

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup()
  const handleSubmit = jest.fn()
  
  render(<LoginForm onSubmit={handleSubmit} />)
  
  // Fill form
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  
  // Submit
  await user.click(screen.getByRole('button', { name: /login/i }))
  
  // Verify
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

### 5. Conditional Rendering Pattern

```typescript
it('should show edit button for own messages', () => {
  const message = createMockMessage({ user_id: currentUserId })
  
  render(<MessageItem message={message} currentUserId={currentUserId} />)
  
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
})

it('should not show edit button for other messages', () => {
  const message = createMockMessage({ user_id: 'other-user' })
  
  render(<MessageItem message={message} currentUserId={currentUserId} />)
  
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
})
```

---

## 🪝 Hook Testing Patterns

### 1. Basic Hook Testing

```typescript
import { renderHook } from '@testing-library/react'

it('should initialize with default value', () => {
  const { result } = renderHook(() => useCounter(0))
  
  expect(result.current.count).toBe(0)
})
```

### 2. Hook with Updates

```typescript
import { renderHook, act } from '@testing-library/react'

it('should increment counter', () => {
  const { result } = renderHook(() => useCounter(0))
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

### 3. Hook with Dependencies

```typescript
it('should update when dependency changes', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 100),
    { initialProps: { value: 'initial' } }
  )
  
  expect(result.current).toBe('initial')
  
  rerender({ value: 'updated' })
  
  jest.advanceTimersByTime(100)
  
  expect(result.current).toBe('updated')
})
```

### 4. Hook with Async Operations

```typescript
import { waitFor } from '@testing-library/react'

it('should fetch data', async () => {
  mockFetch({ data: mockData })
  
  const { result } = renderHook(() => useAsyncData('/api/data'))
  
  expect(result.current.loading).toBe(true)
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
  
  expect(result.current.data).toEqual(mockData)
})
```

---

## 🔌 API Testing Patterns

### 1. Successful API Call Pattern

```typescript
it('should fetch data successfully', async () => {
  const mockData = { id: '1', name: 'Test' }
  mockFetch(mockData)
  
  const result = await api.getData('1')
  
  expect(result.success).toBe(true)
  expect(result.data).toEqual(mockData)
  expect(fetch).toHaveBeenCalledWith('/api/data/1', expect.any(Object))
})
```

### 2. Error Handling Pattern

```typescript
it('should handle API errors', async () => {
  mockFetch({ error: 'Not found' }, false, 404)
  
  const result = await api.getData('999')
  
  expect(result.success).toBe(false)
  expect(result.error).toBeDefined()
  expect(result.error.message).toContain('Not found')
})
```

### 3. Retry Logic Pattern

```typescript
it('should retry failed requests', async () => {
  const mockFn = jest.fn()
    .mockRejectedValueOnce(new Error('Network error'))
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce({ success: true, data: mockData })
  
  global.fetch = mockFn
  
  const result = await api.getData('1')
  
  expect(result.success).toBe(true)
  expect(mockFn).toHaveBeenCalledTimes(3)
})
```

### 4. Request Configuration Pattern

```typescript
it('should include CSRF token in request', async () => {
  mockFetch({ success: true })
  
  await api.postData('/api/data', { value: 'test' })
  
  expect(fetch).toHaveBeenCalledWith(
    '/api/data',
    expect.objectContaining({
      headers: expect.objectContaining({
        'X-CSRF-Token': expect.any(String),
      }),
    })
  )
})
```

---

## 🎭 Mocking Patterns

### 1. Module Mock Pattern

```typescript
// Mock entire module
jest.mock('@/lib/api', () => ({
  api: {
    getData: jest.fn(),
    postData: jest.fn(),
  },
}))

// Import mocked module
import { api } from '@/lib/api'

it('should use mocked API', async () => {
  (api.getData as jest.Mock).mockResolvedValue({ success: true })
  
  const result = await api.getData('1')
  
  expect(result.success).toBe(true)
})
```

### 2. Partial Mock Pattern

```typescript
// Mock specific functions, keep others real
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  debounce: jest.fn((fn) => fn),
}))
```

### 3. Mock Implementation Pattern

```typescript
const mockFetch = jest.fn()

beforeEach(() => {
  global.fetch = mockFetch
})

it('should handle successful response', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' }),
  })
  
  const data = await fetchData()
  expect(data).toEqual({ data: 'test' })
})
```

### 4. Spy Pattern

```typescript
it('should call console.error on failure', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  
  functionThatLogsErrors()
  
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error'))
  
  consoleSpy.mockRestore()
})
```

---

## ⏱ Timer Testing Patterns

### 1. Fake Timers Pattern

```typescript
describe('Debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  it('should debounce function calls', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)
    
    debouncedFn()
    debouncedFn()
    debouncedFn()
    
    expect(fn).not.toHaveBeenCalled()
    
    jest.advanceTimersByTime(100)
    
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
```

### 2. Timeout Testing Pattern

```typescript
it('should timeout after specified duration', async () => {
  jest.useFakeTimers()
  
  const promise = functionWithTimeout(1000)
  
  jest.advanceTimersByTime(1000)
  
  await expect(promise).rejects.toThrow('Timeout')
  
  jest.useRealTimers()
})
```

---

## 🔄 State Testing Patterns

### 1. Zustand Store Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useChatStore } from '@/lib/chat-store/chats/provider'

it('should add chat to store', () => {
  const { result } = renderHook(() => useChatStore())
  
  act(() => {
    result.current.addChat(mockChat)
  })
  
  expect(result.current.chats).toContain(mockChat)
})
```

### 2. Context Testing Pattern

```typescript
import { renderHook } from '@testing-library/react'

function wrapper({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

it('should use theme from context', () => {
  const { result } = renderHook(() => useTheme(), { wrapper })
  
  expect(result.current.theme).toBe('light')
})
```

---

## ❌ Anti-Patterns to Avoid

### 1. Testing Implementation Details

```typescript
// ❌ Bad - Testing internal state
it('should update state', () => {
  const component = new Component()
  component.setState({ count: 1 })
  expect(component.state.count).toBe(1)
})

// ✅ Good - Testing behavior
it('should display updated count', () => {
  render(<Counter />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### 2. Over-Mocking

```typescript
// ❌ Bad - Mocking everything
jest.mock('@/lib/utils')
jest.mock('@/lib/api')
jest.mock('@/components/Button')

// ✅ Good - Mock only external dependencies
jest.mock('@/lib/api')
// Test real utils and components
```

### 3. Shared Test State

```typescript
// ❌ Bad - Shared state between tests
let user = createMockUser()

it('test 1', () => {
  user.name = 'Changed'
})

it('test 2', () => {
  // user.name is 'Changed', not original value!
})

// ✅ Good - Fresh state for each test
it('test 1', () => {
  const user = createMockUser()
  user.name = 'Changed'
})

it('test 2', () => {
  const user = createMockUser()
  // user has original values
})
```

### 4. Testing Multiple Things

```typescript
// ❌ Bad - Testing multiple behaviors
it('should handle user actions', async () => {
  render(<Component />)
  
  await user.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByText('Edit Mode')).toBeInTheDocument()
  
  await user.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByText('Deleted')).toBeInTheDocument()
  
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByText('Edit Mode')).not.toBeInTheDocument()
})

// ✅ Good - Separate tests
it('should enter edit mode when edit button clicked', async () => {
  render(<Component />)
  await user.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByText('Edit Mode')).toBeInTheDocument()
})

it('should delete item when delete button clicked', async () => {
  render(<Component />)
  await user.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByText('Deleted')).toBeInTheDocument()
})
```

---

## 🎯 Pattern Selection Guide

### When to use each pattern:

| Pattern | Use When | Example |
|---------|----------|---------|
| AAA | Always | All tests |
| Single Responsibility | Always | All tests |
| Test Data Builder | Need complex test data | User, Chat, Message objects |
| Setup/Teardown | Repeated setup needed | Store initialization, mock setup |
| Render and Query | Testing components | Component rendering tests |
| User Interaction | Testing UI interactions | Click, type, form submit |
| Async Component | Testing async behavior | Data fetching, loading states |
| Form Testing | Testing forms | Login, settings, chat input |
| Hook Testing | Testing custom hooks | useDebounce, useAsync |
| API Testing | Testing API calls | fetch, API client methods |
| Mocking | Need to isolate code | External APIs, complex dependencies |
| Timer Testing | Testing time-based code | Debounce, throttle, timeouts |
| State Testing | Testing state management | Zustand stores, Context |

---

## 📝 Checklist for Writing Tests

Before considering a test complete, verify:

- [ ] Test name clearly describes what is being tested
- [ ] Test follows AAA pattern
- [ ] Test has single responsibility
- [ ] Test is isolated (no shared state)
- [ ] Test cleans up after itself
- [ ] Test doesn't test implementation details
- [ ] Test uses appropriate queries (getByRole, getByText, etc.)
- [ ] Test handles async operations correctly
- [ ] Test mocks only necessary dependencies
- [ ] Test is fast (< 100ms for unit tests)

---

**Status**: Active Reference  
**Last Updated**: October 15, 2025  
**See Also**: [TESTING.md](./TESTING.md), [MOCKING.md](./MOCKING.md)
