# Phase 5 Sprint 2 - Technical Debt Cleanup

**Date**: October 15, 2025  
**Status**: IN PROGRESS  
**Goal**: Fix 102 component test failures

---

## Current Situation

### What's Working ✅
- MCP Integration deployed and live
- 175 functional tests passing (100%)
- Production build working
- All features functional

### What Needs Fixing ⚠️
- 102 component tests failing
- Root cause: React 18 production build in test environment
- Error: "act(...) is not supported in production builds of React"

---

## Problem Analysis

### Issue
Component tests are importing React production build instead of development build, causing `act()` errors.

### Why This Happens
- Next.js optimizes imports for production
- Jest environment not properly configured for React development mode
- React 18.3.1 has stricter requirements for testing

### Attempted Fixes
1. ✅ Created tsconfig.test.json for test-specific TypeScript config
2. ✅ Updated jest.config.js to use tsconfig.test.json
3. ⚠️ Added testEnvironmentOptions - still failing
4. ⏳ Need different approach

---

## Solution Options

### Option A: Downgrade to React 18.2 (FAST)
**Time**: 10 minutes  
**Pros**: Known to work, simple fix  
**Cons**: Not latest React version  

```bash
npm install react@18.2.0 react-dom@18.2.0
npm test
```

### Option B: Fix Jest Module Resolution (MEDIUM)
**Time**: 30-60 minutes  
**Pros**: Keeps React 18.3.1, proper fix  
**Cons**: Complex configuration  

Need to:
1. Configure moduleNameMapper for React
2. Force development build in tests
3. Update transform configuration
4. Potentially add custom resolver

### Option C: Skip Component Tests Temporarily (PRAGMATIC)
**Time**: 5 minutes  
**Pros**: Unblocks other work  
**Cons**: Tests not running  

```json
// jest.config.js
testPathIgnorePatterns: [
  '<rootDir>/node_modules/',
  '<rootDir>/.next/',
  '<rootDir>/__tests__/components/', // Temporary
],
```

### Option D: Move to Vitest (FUTURE)
**Time**: 2-4 hours  
**Pros**: Better React 18 support, faster tests  
**Cons**: Major change, migration effort  

Modern alternative to Jest with better ESM/React support.

---

## Recommended Action

### RECOMMENDATION: Option B (Fix Jest Properly)

**Reasoning:**
1. Maintains latest React version
2. Proper long-term solution
3. Learn and document the fix
4. Other projects benefit from knowledge

### Implementation Plan

#### Step 1: Configure Jest Module Mapper
```javascript
// jest.config.js
moduleNameMapper: {
  '^react$': '<rootDir>/node_modules/react/cjs/react.development.js',
  '^react-dom$': '<rootDir>/node_modules/react-dom/cjs/react-dom.development.js',
  '^@/(.*)$': '<rootDir>/$1',
},
```

#### Step 2: Update Transform Config
```javascript
transform: {
  '^.+\\.(ts|tsx)$': ['@swc/jest', {
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }],
},
```

#### Step 3: Add Custom Test Environment
Create `jest.environment.js` to force development mode.

#### Step 4: Verify
```bash
npm test -- __tests__/components/ui/badge.test.tsx
```

---

## Alternative: Quick Win Strategy

If time-constrained, do **Option A (Downgrade)** now, then **Option B (Fix)** later.

### Quick Win Steps
```bash
# 1. Downgrade React
npm install react@18.2.0 react-dom@18.2.0

# 2. Run tests
npm test

# 3. If passing, commit
git add package.json package-lock.json
git commit -m "fix: downgrade React to 18.2.0 for test compatibility"

# 4. Document upgrade path
# Create REACT_18_3_UPGRADE.md with steps to upgrade back
```

---

## Current Files Modified

1. `tsconfig.test.json` - Created test-specific TypeScript config ✅
2. `jest.config.js` - Updated to use tsconfig.test.json ✅
3. `jest.setup.js` - Attempted React development mode (reverted)

---

## Next Steps

**Choose one:**

1. **Execute Option A** (React downgrade) - 10 min
2. **Execute Option B** (Fix Jest) - 30-60 min
3. **Execute Option C** (Skip tests) - 5 min
4. **Different priority** (MCP features, performance, etc.)

---

## Decision Needed

**What should we do?**

A. Fix tests properly (Option B) - Invest time for proper solution  
B. Quick downgrade (Option A) - Fast fix, revisit later  
C. Skip for now (Option C) - Focus on features  
D. Something else - Different priority

**Your choice?**

---

**Status**: Awaiting decision  
**Time**: 12:30 UTC  
**Branch**: main (clean, deployed)
