# Testing Guide

**Project**: Zola  
**Last Updated**: October 15, 2025  
**Status**: Testing Infrastructure Setup (In Progress)

---

## 📋 Overview

This guide covers testing strategies, patterns, and practices for the Zola project. We aim for comprehensive test coverage while maintaining fast, reliable, and maintainable tests.

---

## 🎯 Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test public APIs and user-facing behavior
   - Avoid testing internal implementation details

2. **Fast and Reliable**
   - Tests should run quickly (< 5 seconds for unit tests)
   - Tests should be deterministic (no flaky tests)
   - Tests should be isolated (no shared state)

3. **Maintainable**
   - Clear, descriptive test names
   - Well-organized test structure
   - Shared utilities and mocks
   - Easy to understand and modify

4. **Comprehensive**
   - Cover critical paths thoroughly
   - Test edge cases and error conditions
   - Aim for 70%+ code coverage

---

## 🏗 Testing Infrastructure

### Current Setup

**Testing Framework**: Jest 29.7.0  
**Testing Library**: React Testing Library 14.x  
**Environment**: jsdom (browser simulation)

### Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup
- `__tests__/utils/` - Test utilities and mocks

### Directory Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── utils/              # Utility function tests
│   ├── hooks/              # Custom hook tests
│   ├── api/                # API client tests
│   └── models/             # Model configuration tests
│
├── components/              # Component tests
│   ├── chat/               # Chat component tests
│   ├── history/            # History component tests
│   └── sidebar/            # Sidebar component tests
│
├── integration/             # Integration tests
│   ├── api-integration.test.ts
│   ├── state-management.test.ts
│   └── user-flows.test.ts
│
└── utils/                   # Test utilities
    ├── mocks/              # Mock implementations
    ├── helpers.ts          # Test helper functions
    └── setup.ts            # Common test setup
```

---

## 🧪 Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, utilities, and hooks in isolation

**Location**: `__tests__/unit/`

**Examples**:
- Utility functions (formatNumber, debounce, cn)
- Custom hooks (useDebounce, useAsync)
- API client methods
- Data transformations

**Pattern**:
```typescript
describe('FunctionName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionName(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### 2. Component Tests

**Purpose**: Test React components and their interactions

**Location**: `__tests__/components/`

**Examples**:
- Message rendering
- Button interactions
- Form submissions
- Conditional rendering

**Pattern**:
```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '@/path/to/component'

describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    render(<ComponentName prop="value" />)
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### 3. Integration Tests

**Purpose**: Test multiple components/modules working together

**Location**: `__tests__/integration/`

**Examples**:
- API calls + state updates
- User flows across multiple components
- Data persistence
- Authentication flows

**Pattern**:
```typescript
describe('Feature Integration', () => {
  it('should complete user flow', async () => {
    // Arrange
    render(<App />)
    
    // Act
    await userEvent.click(screen.getByRole('button'))
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })
})
```

---

## 📝 Writing Tests

### Test Structure (AAA Pattern)

```typescript
describe('Feature or Component', () => {
  describe('specific functionality', () => {
    it('should do something when condition', () => {
      // Arrange - Set up test data and dependencies
      const input = 'test'
      const expectedOutput = 'TEST'
      
      // Act - Execute the code being tested
      const result = transform(input)
      
      // Assert - Verify the result
      expect(result).toBe(expectedOutput)
    })
  })
})
```

### Test Naming Conventions

**Good test names** describe:
1. What is being tested
2. Under what circumstances
3. What the expected result is

```typescript
// ✅ Good
it('should return uppercase string when input is lowercase', () => {})
it('should throw error when input is null', () => {})
it('should call callback after delay', () => {})

// ❌ Bad
it('test 1', () => {})
it('should work', () => {})
it('edge case', () => {})
```

### Testing Async Code

```typescript
// Using async/await
it('should fetch data successfully', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})

// Using waitFor
it('should show success message', async () => {
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})

// Using findBy queries (automatically waits)
it('should display loaded content', async () => {
  render(<Component />)
  
  const content = await screen.findByText('Loaded')
  expect(content).toBeInTheDocument()
})
```

### Testing User Interactions

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('should handle button click', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup()
  const handleSubmit = jest.fn()
  
  render(<Form onSubmit={handleSubmit} />)
  
  // Fill out form
  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.type(screen.getByLabelText('Email'), 'john@example.com')
  
  // Submit
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  
  // Verify
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  })
})
```

---

## 🎭 Mocking

### Mocking Modules

```typescript
// Mock entire module
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
}))

// Mock specific function
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  debounce: jest.fn((fn) => fn),
}))
```

### Mocking Supabase

```typescript
import { mockSupabaseClient } from '@/__tests__/utils/mocks'

jest.mock('@/lib/supabase/client', () => ({
  createClientComponentClient: () => mockSupabaseClient,
}))

// In test
mockSupabaseClient.from('chats').select.mockResolvedValueOnce({
  data: [{ id: '1', title: 'Test Chat' }],
  error: null,
})
```

### Mocking Next.js Router

```typescript
import { mockRouter } from '@/__tests__/utils/mocks'

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// In test
mockRouter.push.mockClear()
// ... perform action
expect(mockRouter.push).toHaveBeenCalledWith('/expected-path')
```

### Mocking Fetch

```typescript
import { mockFetch } from '@/__tests__/utils/helpers'

beforeEach(() => {
  mockFetch({ success: true, data: {} })
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

---

## 🔧 Test Utilities

### Available Utilities

Located in `__tests__/utils/`:

#### Mocks (`mocks/index.ts`)
- `mockSupabaseClient` - Supabase client mock
- `mockRouter` - Next.js router mock
- `createMockStore` - Zustand store mock
- `mockUser`, `mockChat`, `mockMessage` - Test data

#### Helpers (`helpers.ts`)
- `renderWithProviders` - Render with React context providers
- `waitForCondition` - Wait for a condition to be true
- `createMockEvent` - Create mock DOM events
- `createMockFile` - Create mock File objects
- `mockLocalStorage` - Mock localStorage
- `mockFetch` - Mock global fetch

---

## 📊 Code Coverage

### Coverage Goals

| Category | Target | Priority |
|----------|--------|----------|
| Utilities | 90%+ | High |
| API Client | 90%+ | High |
| Custom Hooks | 85%+ | High |
| Components | 70%+ | Medium |
| Integration | 60%+ | Medium |

### Running Coverage

```bash
# Run all tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

Coverage thresholds are defined in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

---

## 🚀 Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should do something"

# Run only unit tests
npm run test:unit

# Run only component tests
npm run test:components

# Run only integration tests
npm run test:integration
```

### CI/CD

```bash
# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

---

## 🐛 Debugging Tests

### VSCode Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasename}",
        "--config",
        "jest.config.js"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Output

```typescript
// Add debug output in tests
it('should do something', () => {
  const result = someFunction()
  
  console.log('Result:', result)
  screen.debug() // Print DOM
  
  expect(result).toBe(expected)
})
```

### Only Run Specific Tests

```typescript
// Focus on one test
it.only('should do something', () => {})

// Skip a test
it.skip('should do something', () => {})

// Focus on describe block
describe.only('Feature', () => {})
```

---

## ✅ Best Practices

### Do's

- ✅ Test behavior, not implementation
- ✅ Write clear, descriptive test names
- ✅ Keep tests focused and simple
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Clean up after tests (cleanup, restore mocks)
- ✅ Use data-testid for elements hard to query
- ✅ Test edge cases and error conditions
- ✅ Keep tests fast (< 5 seconds for unit tests)

### Don'ts

- ❌ Don't test library internals
- ❌ Don't write overly complex tests
- ❌ Don't use implementation details (class names, internal state)
- ❌ Don't share state between tests
- ❌ Don't make tests dependent on each other
- ❌ Don't test multiple things in one test
- ❌ Don't ignore failing tests (fix or remove them)
- ❌ Don't mock everything (test real behavior when possible)

---

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Articles
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Fix the "not wrapped in act(...)" warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)
- [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)

---

## 🔍 Examples

### Example: Testing Utility Function

```typescript
// lib/utils.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// __tests__/unit/utils/currency.test.ts
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('should format negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should format decimals', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})
```

### Example: Testing Component

```typescript
// components/Button.tsx
export function Button({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Example: Testing API Call

```typescript
// lib/api/resources/user.ts
export async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// __tests__/unit/api/user.test.ts
import { getUser } from '@/lib/api/resources/user'
import { mockFetch } from '@/__tests__/utils/helpers'

describe('getUser', () => {
  it('should fetch user data', async () => {
    const mockUser = { id: '1', name: 'John Doe' }
    mockFetch(mockUser)
    
    const user = await getUser('1')
    
    expect(user).toEqual(mockUser)
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })

  it('should handle errors', async () => {
    mockFetch(null, false, 404)
    
    await expect(getUser('999')).rejects.toThrow()
  })
})
```

---

## 📝 TODO

### Phase 4A: Infrastructure ✅
- [x] Install testing dependencies
- [x] Configure Jest
- [x] Create test utilities
- [x] Add test scripts
- [x] Write testing documentation

### Phase 4B: Unit Tests 🔄
- [ ] Test utility functions (15+ tests)
- [ ] Test custom hooks (8+ tests)
- [ ] Test API client (20+ tests)
- [ ] Test model configuration (5+ tests)

### Phase 4C: Component Tests 🔄
- [ ] Test message components
- [ ] Test sidebar components
- [ ] Test history components
- [ ] Test settings components

### Phase 4D: Integration Tests 🔄
- [ ] Test API integration
- [ ] Test state management
- [ ] Test user flows

### Phase 4E: CI/CD ⏳
- [ ] Set up GitHub Actions
- [ ] Configure coverage reporting
- [ ] Add pre-commit hooks

---

**Status**: Infrastructure Complete, Tests In Progress  
**Last Updated**: October 15, 2025  
**Next Steps**: Complete unit tests for utilities and hooks
