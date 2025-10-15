# Contributing to Project Zulu

Thank you for your interest in contributing to Project Zulu! This document provides guidelines and instructions for contributing.

---

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/mnhidayatgani/zulu/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features
1. Check [Discussions](https://github.com/mnhidayatgani/zulu/discussions) for similar ideas
2. Create a new discussion or issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Code Contributions

#### Setup Development Environment
```bash
# Fork and clone the repository
git clone https://github.com/mnhidayatgani/zulu.git
cd zulu

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

#### Making Changes
1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style

3. Write or update tests:
   ```bash
   npm run test
   ```

4. Run type checking:
   ```bash
   npm run type-check
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

6. Commit your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```

#### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

#### Pull Request Process
1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

4. Wait for review and address feedback

---

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types when they might be reused

### React Components
- Use functional components with hooks
- Use `"use client"` directive for client components
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Organization
- Place app-specific components in `app/components/`
- Place reusable components in `components/`
- Place utilities in `lib/`
- Group related files together

### Naming Conventions
- **Components**: PascalCase (`MyComponent.tsx`)
- **Files**: kebab-case (`my-utility.ts`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

---

## 🧪 Testing

### Writing Tests
- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both success and error cases

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  })

  it('should handle user interaction', () => {
    // Test implementation
  })
})
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and components
- Explain complex logic with inline comments
- Update README when adding features

### Example:
```typescript
/**
 * Formats a user message for display
 * @param message - The raw message content
 * @param options - Formatting options
 * @returns Formatted message string
 */
function formatMessage(message: string, options?: FormatOptions): string {
  // Implementation
}
```

---

## 🏗️ Architecture Guidelines

### Component Structure
- Keep components under 300 lines
- Extract complex logic into hooks
- Use composition over inheritance
- Separate concerns (UI, logic, data)

### State Management
- Use Zustand for global state
- Use TanStack Query for server state
- Use React Context sparingly
- Keep state as local as possible

### API Routes
- Follow RESTful conventions
- Validate input data
- Handle errors gracefully
- Return consistent response formats

---

## 🎯 Priorities

### High Priority
- Bug fixes
- Security issues
- Performance improvements
- User experience enhancements

### Medium Priority
- New features
- Refactoring
- Test coverage
- Documentation

### Low Priority
- Code style improvements
- Minor optimizations
- Nice-to-have features

---

## 🚫 What Not to Do

- Don't commit API keys or secrets
- Don't include large files or dependencies
- Don't copy code without attribution
- Don't break existing functionality
- Don't ignore linting errors
- Don't skip writing tests

---

## 💬 Communication

### Getting Help
- Check documentation first
- Search existing issues
- Ask in Discussions
- Be respectful and patient

### Reporting Security Issues
Do not create public issues for security vulnerabilities.
Email: security@yourdomain.com

---

## 📜 License

By contributing to Project Zulu, you agree that your contributions will be licensed under the Apache License 2.0.

---

## 🙏 Recognition

Contributors will be:
- Added to CREDITS.md
- Mentioned in release notes
- Acknowledged in the community

Thank you for making Project Zulu better!

---

**Questions?** Open a discussion or reach out to the maintainers.
