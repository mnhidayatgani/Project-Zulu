/**
 * Test Utilities - Helpers
 * Shared test helper functions
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Create a mock event
 */
export function createMockEvent<T = Element>(
  type: string,
  target?: Partial<T>
): Event & { target: T } {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'target', {
    writable: false,
    value: target,
  })
  return event as Event & { target: T }
}

/**
 * Create a mock file
 */
export function createMockFile(
  name: string,
  size: number,
  type: string,
  content = ''
): File {
  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  
  // Override size property
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  })
  
  // Add arrayBuffer method if it doesn't exist (for Node environment)
  if (!file.arrayBuffer) {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async function() {
        // Create a buffer with the specified size
        const buffer = new ArrayBuffer(Math.min(size, 4100))
        return buffer
      },
    })
  }
  
  return file
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }
  
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
  
  return {
    restore: () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
    },
  }
}

/**
 * Mock local storage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })
  
  return mockStorage
}

/**
 * Mock fetch
 */
export function mockFetch(response: any, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    headers: new Headers(),
  })
  
  return global.fetch
}

/**
 * Get element by test ID
 */
export function getByTestId(testId: string): HTMLElement | null {
  return document.querySelector(`[data-testid="${testId}"]`)
}

/**
 * Get all elements by test ID
 */
export function getAllByTestId(testId: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(`[data-testid="${testId}"]`))
}
