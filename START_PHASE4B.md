# 🚀 START PHASE 4B - Unit Tests

Copy and paste this prompt to continue:

---

**Continue Phase 4B: Unit Tests**

Context:
- Project: Zola (Next.js 15 AI chat interface)
- Branch: refactor/foundation (26 commits ahead)
- Location: /root/zola
- Status: Phase 4A ✅ COMPLETE, Phase 4B ready to start

Phase 4A Completed:
- ✅ Jest 29.7.0 + React Testing Library configured
- ✅ Test utilities created (__tests__/utils/)
- ✅ 32 initial tests written (utils.test.ts, sanitize.test.ts)
- ✅ 72k+ chars of testing documentation
- ✅ Test patterns established

Phase 4B Objectives:
1. Write utility function tests (15+ tests)
   - lib/encryption.ts (BYOK encryption)
   - lib/file-handling.ts (File operations)
   - lib/user-keys.ts (User key management)
   - lib/csrf.ts (CSRF protection)

2. Write custom hook tests (8+ tests)
   - lib/hooks/use-debounce.ts
   - lib/hooks/use-async.ts
   - lib/hooks/use-local-storage.ts
   - lib/hooks/use-media-query.ts
   - lib/hooks/use-breakpoint.ts
   - lib/hooks/use-interval.ts
   - lib/hooks/use-previous.ts
   - lib/hooks/use-state-helpers.ts

3. Write API client tests (20+ tests)
   - lib/api/client.ts (HTTP methods, retries, errors, CSRF)
   - lib/api/resources/chat.ts
   - lib/api/resources/user.ts
   - lib/api/resources/models.ts
   - lib/api/resources/projects.ts
   - lib/api/resources/system.ts

4. Write model configuration tests (5+ tests)
   - lib/models/index.ts (Model registry, lookup)

Target: 48+ additional tests
Goal: Achieve 80%+ coverage for tested modules

Current Setup:
- Jest configured (jest.config.js, jest.setup.js)
- Test utilities ready (__tests__/utils/mocks/, helpers.ts, setup.ts)
- Test patterns documented (docs/TESTING_PATTERNS.md)
- AAA pattern established
- Mock utilities available

First Steps:
1. Verify test setup works: npm test
2. If tests pass, continue with utility tests
3. If tests fail, fix configuration first
4. Use test utilities from __tests__/utils/
5. Follow patterns from docs/TESTING_PATTERNS.md

Reference Files:
- PHASE4_PLAN.md - Complete phase plan
- PHASE4A_COMPLETE.md - What was done in 4A
- docs/TESTING.md - Testing guide with examples
- docs/TESTING_PATTERNS.md - Pattern reference

Please start Phase 4B by:
1. Verifying the test setup works
2. Creating tests for lib/encryption.ts
3. Then continue with other utility tests
4. Follow the objectives listed above

Working directory: /root/zola
