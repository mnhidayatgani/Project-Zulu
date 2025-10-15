/**
 * Test Setup
 * Common setup for all tests
 */

import { resetAllMocks } from './mocks'

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  resetAllMocks()
  
  // Clear all timers
  jest.clearAllTimers()
  
  // Reset modules
  jest.resetModules()
})

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Restore all mocks
  jest.restoreAllMocks()
})

// Global test configuration
export {}
