# Local Development to Vercel Deployment - Efficient Workflow

## Quick Setup Commands

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Create local environment file
cp .env.example .env.local

# 3. Start development server with Turbopack (fast!)
npm run dev

# 4. In separate terminal - watch for type errors
npm run type-check -- --watch
```

## Essential Environment Variables for Local Development

Edit `.env.local`:

```bash
# Minimal setup for local development
CSRF_SECRET=your_32_char_random_string_here

# Add only the AI providers you want to test
OPENAI_API_KEY=sk-your-key-here
# ANTHROPIC_API_KEY=
# GOOGLE_GENERATIVE_AI_API_KEY=
# MISTRAL_API_KEY=

# Optional: Local Ollama (no API key needed)
OLLAMA_BASE_URL=http://localhost:11434

# Skip Supabase for now if just testing AI features
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Efficient Development Workflow

### Phase 1: Local Development
```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Type checking (optional but recommended)
npm run type-check -- --watch

# Access: http://localhost:3000
```

### Phase 2: Pre-Deployment Checklist
```bash
# 1. Type check
npm run type-check

# 2. Lint code
npm run lint

# 3. Test production build locally
npm run build
npm start

# 4. Check build output
# Should see: "✓ Compiled successfully"
```

### Phase 3: Vercel Deployment

#### Option A: Via Vercel CLI (Fastest)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Option B: Via Git Push (Automatic)
```bash
# Push to GitHub
git add .
git commit -m "your changes"
git push origin main

# Vercel auto-deploys from GitHub
```

## Performance Optimizations

### 1. Turbopack (Already Enabled)
- Faster than Webpack
- Already in `package.json`: `"dev": "next dev --turbopack"`
- No action needed ✓

### 2. Build Optimizations
Already configured in `next.config.ts`:
- Standalone output (smaller Docker images)
- Package imports optimization
- Image optimization enabled

### 3. Recommended: Add `.vercelignore`
```bash
# Create .vercelignore to skip unnecessary files
cat > .vercelignore << 'EOF'
.agent-memory
scripts/memory-cli.js
*.md
.git
.github
node_modules
.next
EOF
```

## Development Best Practices

### 1. Hot Reload Testing
- Save file → Auto-reload in browser
- No need to restart server
- Turbopack makes it instant

### 2. Component Development
```bash
# Test specific components without full app
# Create test page: app/test/page.tsx
```

### 3. API Testing
```bash
# Use curl or Postman to test API routes
curl http://localhost:3000/api/health

# Or use the app itself to test chat
```

### 4. Database (Supabase)
**For efficiency:**
- Use Supabase local development (optional)
- Or connect to cloud Supabase directly
- Set up once, use everywhere

### 5. Git Workflow
```bash
# Commit frequently
git add .
git commit -m "feat: add feature X"

# Push when ready
git push
```

## Vercel-Specific Setup

### Required Environment Variables in Vercel
```
CSRF_SECRET=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
ENCRYPTION_KEY= (for BYOK)
```

### Vercel Dashboard Settings
1. Build Command: `npm run build` (default)
2. Output Directory: `.next` (default)
3. Install Command: `npm install` (default)
4. Node Version: 18.x or 20.x
5. Environment Variables: Add all from `.env.local`

## Time-Saving Tips

### 1. Skip Full Supabase Setup Initially
- Guest mode works without auth
- Test AI features first
- Add Supabase later

### 2. Use Single AI Provider First
- Just OpenAI to start
- Add others incrementally
- Reduces complexity

### 3. Enable Vercel Preview Deployments
- Every git push = preview URL
- Test before production
- Share with team

### 4. Use Vercel Analytics (Optional)
- Free tier available
- Monitor performance
- Track usage

## Common Issues & Solutions

### Issue: Build fails on Vercel
**Solution:**
```bash
# Test locally first
npm run build

# Check for:
# - TypeScript errors
# - Missing env vars
# - Import errors
```

### Issue: API routes don't work
**Solution:**
- Verify CSRF_SECRET is set
- Check environment variables
- Test locally first

### Issue: Slow builds
**Solution:**
- Vercel caches dependencies
- First build: ~2-3 minutes
- Subsequent: ~30-60 seconds

## Deployment Checklist

Before deploying to Vercel:

- [ ] All environment variables configured
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes  
- [ ] `npm run build` succeeds locally
- [ ] Test production build: `npm start`
- [ ] Git committed and pushed
- [ ] Vercel project connected to GitHub repo

## Recommended Dev Tools

```bash
# VS Code extensions (optional but helpful)
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - TypeScript Vue Plugin (Volar)
```

## Monitoring After Deployment

```bash
# Check Vercel deployment logs
vercel logs

# Monitor via Vercel dashboard
# https://vercel.com/dashboard
```

## Summary: Most Efficient Path

1. **Local**: `npm install` → Edit `.env.local` → `npm run dev`
2. **Test**: Make changes → Hot reload → Verify
3. **Pre-deploy**: `npm run type-check` → `npm run build`
4. **Deploy**: `git push` OR `vercel --prod`
5. **Monitor**: Check Vercel dashboard for status

**Time estimate:**
- Setup: 5-10 minutes
- Each deployment: 1-2 minutes
- Build time: 30-90 seconds

---

**Pro tip**: Use `vercel dev` for local development that mimics Vercel environment exactly, including edge functions and environment variables from Vercel.
