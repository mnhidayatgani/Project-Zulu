# 🚀 PART 1: QUICK START GUIDE

## ⏱️ Get Started in 5 Minutes

This guide gets you from zero to having your fork properly set up.

---

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (need 18+)
node --version  # Should be v18.0.0 or higher

# Check npm
npm --version

# Check git
git --version

# Check you're in the project directory
pwd  # Should show /root/zola or similar
```

---

## 🎯 Option 1: Automated Setup (RECOMMENDED)

### Step 1: Prepare Information

Have ready:
- Your GitHub username
- Your full name
- Your email
- Desired project name (e.g., "zola-enhanced", "zola-pro")

### Step 2: Run Setup Script

```bash
cd /root/zola
./setup-fork.sh
```

The script will:
1. ✅ Ask for your information
2. ✅ Update package.json with your details
3. ✅ Create CREDITS.md for attribution
4. ✅ Create CHANGELOG.md
5. ✅ Update README.md
6. ✅ Install logger (pino)
7. ✅ Create initial git commit
8. ✅ Configure remote

**Time**: 5-10 minutes

### Step 3: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: Use same name from setup script
3. Description: "Enhanced fork of Zola with improvements"
4. Public or Private: Your choice
5. **DON'T** initialize with README (already have one)
6. Click "Create repository"

### Step 4: Push Your Changes

```bash
# Push to your new repo
git push -u origin refactor/foundation

# You should see output like:
# Enumerating objects: X, done.
# Writing objects: 100% (X/X), done.
# * [new branch]      refactor/foundation -> refactor/foundation
```

### Step 5: Verify Setup

```bash
# Check remote URL
git remote -v
# Should show YOUR GitHub username

# Check author in package.json
grep '"author"' package.json
# Should show YOUR name

# Check new files exist
ls -la CREDITS.md CHANGELOG.md
```

**✅ If all checks pass, you're done!**

---

## 🛠️ Option 2: Manual Setup

If automated script doesn't work, follow these steps:

### Step 1: Update package.json

```bash
# Edit package.json manually
nano package.json  # or your preferred editor

# Change these fields:
{
  "name": "your-project-name",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "contributors": [
    "Julien Thibeaut (Original Author)",
    "ibelick"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/your-project-name"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/your-project-name/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/your-project-name#readme"
}
```

### Step 2: Create CREDITS.md

```bash
cat > CREDITS.md << 'EOF'
# Credits

This project is a fork and enhancement of [Zola](https://github.com/ibelick/zola).

## Original Authors

- **Julien Thibeaut** ([@ibelick](https://github.com/ibelick)) - Original creator
- **ibelick** - Core development

## Enhancements & Modifications

This fork includes significant enhancements by:

- **Your Name** ([@your-username](https://github.com/your-username))

### Major Changes

- Fixed critical TypeScript errors
- Enhanced authentication system
- Improved error handling
- Added comprehensive testing
- Performance optimizations
- Enhanced documentation
- Security improvements

## License

This project maintains the Apache 2.0 license from the original.

Original project: © Julien Thibeaut  
Enhancements: © 2024 Your Name
EOF
```

### Step 3: Create CHANGELOG.md

```bash
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Enhanced authentication with email/password and OAuth
- Password reset functionality
- Comprehensive documentation
- CREDITS.md for attribution
- This CHANGELOG.md

### Fixed
- Server-side authentication errors
- Image component configuration
- Error handling improvements

### Changed
- Improved login UI with tabs
- Enhanced error messages
- Better loading states

### Security
- CSRF protection improvements
- Better session management
- Input validation

## [0.1.0] - 2024-10-15

### Initial Fork
- Forked from ibelick/zola
- Established as independent project
EOF
```

### Step 4: Install Logger

```bash
# Install pino logger
npm install pino pino-pretty --save

# Create logger utility
mkdir -p lib/utils
cat > lib/utils/logger.ts << 'EOF'
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export const log = {
  info: (msg: string, ...args: unknown[]) => logger.info(msg, ...args),
  error: (msg: string, ...args: unknown[]) => logger.error(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => logger.warn(msg, ...args),
  debug: (msg: string, ...args: unknown[]) => logger.debug(msg, ...args),
}
EOF
```

### Step 5: Git Commit

```bash
# Create branch
git checkout -b refactor/foundation

# Stage changes
git add .

# Commit
git commit -m "chore: establish fork ownership and initial setup

- Update package.json with new author info
- Create CREDITS.md for attribution
- Create CHANGELOG.md
- Add logger utility
- Setup development foundation

This fork enhances the original Zola project.
Original by Julien Thibeaut: https://github.com/ibelick/zola"

# Configure remote (create repo on GitHub first!)
git remote set-url origin https://github.com/YOUR_USERNAME/your-project-name.git

# Push
git push -u origin refactor/foundation
```

---

## ✅ Post-Setup Verification

### 1. Check Git Status

```bash
git status
# Should show: On branch refactor/foundation

git remote -v
# Should show YOUR GitHub URL
```

### 2. Check Files

```bash
ls -la CREDITS.md CHANGELOG.md lib/utils/logger.ts
# All should exist
```

### 3. Check package.json

```bash
grep -E '"name"|"author"' package.json
# Should show YOUR info
```

### 4. Test Logger

```bash
# Create test file
cat > test-logger.js << 'EOF'
const { log } = require('./lib/utils/logger.ts')
log.info('Logger working!')
EOF

# Run test
node test-logger.js
# Should see colored log output

# Clean up
rm test-logger.js
```

---

## 🎯 What You've Accomplished

After this quick start:

✅ **Legal Setup**: Proper attribution to original authors  
✅ **Ownership**: Your name in package.json  
✅ **Git Setup**: New repository with your remote  
✅ **Documentation**: CREDITS.md, CHANGELOG.md  
✅ **Tools**: Logger utility installed  
✅ **Branch**: Development branch created  

---

## 🚨 Common Issues & Solutions

### Issue 1: Permission Denied

```bash
# If you get permission errors
chmod +x setup-fork.sh
./setup-fork.sh
```

### Issue 2: Git Remote Already Exists

```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/your-project.git
```

### Issue 3: Package.json Not Updating

```bash
# Make sure you're in project root
pwd
# Should show /root/zola

# Try manual edit
nano package.json
```

### Issue 4: Can't Push to GitHub

```bash
# Create repo on GitHub first!
# Then configure remote
git remote set-url origin https://github.com/YOUR_USERNAME/repo-name.git

# Try push again
git push -u origin refactor/foundation
```

---

## 📋 Quick Verification Checklist

- [ ] package.json has your name
- [ ] CREDITS.md exists
- [ ] CHANGELOG.md exists
- [ ] logger.ts created
- [ ] Git remote points to your repo
- [ ] Changes pushed to GitHub
- [ ] Can see repo on GitHub

---

## 🎯 Next Steps

Now that setup is complete:

1. **Read**: `docs/02-LEGAL-ATTRIBUTION.md` (5 min)
2. **Start**: `docs/PHASE-1-FOUNDATION.md` (Begin work!)
3. **Reference**: Keep `docs/COMMANDS.md` handy

---

## 💡 Pro Tips

### Tip 1: Commit Often
```bash
# Make small, focused commits
git add specific-file.ts
git commit -m "fix: specific issue"
```

### Tip 2: Use Meaningful Commit Messages
```
Good: "fix: resolve supabase type error in chat api"
Bad:  "fix stuff"
```

### Tip 3: Keep CHANGELOG Updated
```bash
# After each significant change
nano CHANGELOG.md
# Add entry under [Unreleased]
```

### Tip 4: Branch Strategy
```bash
# Keep main/master clean
# Work in feature branches
git checkout -b feature/new-thing
# When done, merge to refactor/foundation
```

---

## 🎉 You're Ready!

Setup complete! Time to start improving the codebase.

**Your next action**: Read `docs/PHASE-1-FOUNDATION.md`

**Total time invested**: 10-15 minutes  
**Value gained**: Proper foundation for 4-6 weeks of work

---

*Need help? Check `docs/TROUBLESHOOTING.md`*  
*See all docs: `DOCUMENTATION.md`*
