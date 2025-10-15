# CI/CD Documentation

**Last Updated**: October 15, 2025  
**Status**: ✅ Active

---

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The workflows automatically test, build, and deploy the application.

---

## Workflows

### 1. Test Workflow (`test.yml`)

**Triggers**:
- Push to `main`, `develop`, or `refactor/*` branches
- Pull requests to `main` or `develop`

**Jobs**:
1. **Run Tests** (Node 18.x and 20.x)
   - Lint code
   - Type check
   - Run unit tests
   - Run component tests
   - Run integration tests
   - Generate coverage report
   - Upload to Codecov

2. **Test Summary**
   - Aggregates test results
   - Reports overall status

**Duration**: ~3-5 minutes

### 2. CI/CD Pipeline (`ci-cd.yml`)

**Triggers**:
- Push to `main` or `develop`
- Tags matching `v*`

**Jobs**:
1. **Validate**
   - ESLint
   - TypeScript checks
   - Tests

2. **Build**
   - Next.js production build
   - Cache build output
   - Upload artifacts

3. **Docker**
   - Build Docker image
   - Push to GitHub Container Registry
   - Tag appropriately

4. **Deploy** (commented out)
   - Production deployment steps
   - Environment-specific config

**Duration**: ~8-12 minutes

### 3. CodeQL Analysis (`codeql.yml`)

**Triggers**:
- Push to `main`
- Pull requests to `main`
- Weekly schedule

**Purpose**: Security vulnerability scanning

### 4. Code Quality (`codacy.yml`)

**Triggers**:
- Push events
- Pull requests

**Purpose**: Code quality analysis

---

## Running Tests Locally

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Component tests only
npm run test:components

# Integration tests only
npm run test:integration

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Pre-commit Hook

A pre-commit hook automatically runs before each commit:
1. Linter
2. Type check
3. All tests

**Location**: `.husky/pre-commit`

**Skip** (not recommended):
```bash
git commit --no-verify
```

---

## Test Configuration

### Environment
- **NODE_ENV**: `test` for all test runs
- **CI**: `true` in CI environment

### Test Frameworks
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Testing Library User Event**: User interaction simulation

### Test Files
```
__tests__/
├── unit/                   # Unit tests
│   └── utils/
├── components/             # Component tests
│   └── ui/
└── integration/            # Integration tests
```

### Coverage Thresholds
```javascript
{
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  }
}
```

---

## GitHub Actions Setup

### Required Secrets

**For Test Workflow**:
- `CODECOV_TOKEN` (optional) - For coverage reports

**For CI/CD Pipeline**:
- `GITHUB_TOKEN` (auto-provided) - For container registry
- `NEXT_PUBLIC_VERCEL_URL` - Application URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `MISTRAL_API_KEY` - Mistral API key
- `CSRF_SECRET` - CSRF token secret
- `ENCRYPTION_KEY` - For BYOK encryption

**For Deployment** (if enabled):
- `DEPLOY_KEY` - SSH key or deployment token

### Setting Secrets

1. Go to repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secret name and value
5. Click **Add secret**

---

## Monitoring

### Test Results

View test results in GitHub Actions:
1. Go to **Actions** tab
2. Select workflow run
3. Click on job name
4. Expand test steps

### Coverage Reports

Coverage reports are uploaded to Codecov (if configured):
- **URL**: https://codecov.io/gh/YOUR_ORG/YOUR_REPO
- **Badge**: Available in README

### Build Artifacts

Build artifacts are saved for 30 days:
- Test results
- Coverage reports
- Build output

---

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Common Causes**:
1. **Environment differences**
   - Ensure NODE_ENV=test
   - Check Node version (18.x or 20.x)

2. **Missing dependencies**
   - Run `npm ci` instead of `npm install`
   - Check package-lock.json is committed

3. **Timezone issues**
   - Use UTC in tests
   - Mock Date objects

4. **File system differences**
   - Use path.join for paths
   - Case-sensitive file names

**Solution**:
```bash
# Run tests in CI mode locally
CI=true NODE_ENV=test npm test
```

### Build Cache Issues

**Clear cache**:
1. Go to **Actions** tab
2. Click **Caches** in sidebar
3. Delete old caches

Or add `--no-cache` to workflow:
```yaml
- name: Build application
  run: npm run build
  env:
    NEXT_BUILD_NO_CACHE: 1
```

### Timeout Issues

**Increase timeout**:
```yaml
- name: Run Tests
  run: npm test
  timeout-minutes: 15  # Default is 360
```

### Docker Build Failures

**Common issues**:
1. **Out of disk space**
   - Use build cache
   - Clean up old images

2. **Build context too large**
   - Check `.dockerignore`
   - Exclude unnecessary files

3. **Missing build args**
   - Verify all ARG values provided

---

## Performance Optimization

### Caching Strategy

**npm dependencies**:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Build output**:
```yaml
- uses: actions/cache@v4
  with:
    path: .next
    key: build-${{ hashFiles('**/*.ts') }}
```

**Docker layers**:
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Parallel Jobs

Run tests in parallel:
```yaml
strategy:
  matrix:
    test-suite: [unit, component, integration]
```

### Job Dependencies

```yaml
jobs:
  test:
    # ...
  build:
    needs: test  # Only run after test passes
```

---

## Best Practices

### 1. Fast Feedback
- Run linter first (fastest)
- Run tests before build
- Fail fast on errors

### 2. Reliability
- Use specific versions (`@v4` not `@latest`)
- Pin Node.js version
- Lock dependencies with package-lock.json

### 3. Security
- Never commit secrets
- Use GitHub Secrets
- Rotate tokens regularly
- Use least privilege access

### 4. Maintainability
- Document workflow changes
- Use descriptive job names
- Comment complex steps
- Keep workflows DRY

### 5. Cost Optimization
- Cache dependencies
- Use build cache
- Set appropriate timeouts
- Limit workflow runs (e.g., skip on doc changes)

---

## Workflow File Locations

```
.github/
└── workflows/
    ├── test.yml         # Main test workflow
    ├── ci-cd.yml        # CI/CD pipeline
    ├── codeql.yml       # Security scanning
    └── codacy.yml       # Code quality
```

---

## Additional Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

### Example Workflows
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/.github/workflows)
- [React Examples](https://github.com/facebook/react/tree/main/.github/workflows)

---

## Support

For issues with CI/CD:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check repository issues
4. Contact maintainers

---

**Maintained by**: Development Team  
**Last Review**: October 15, 2025
