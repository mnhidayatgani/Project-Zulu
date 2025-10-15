# 📋 Deployment Checklist - Project Zulu

## ✅ Pre-Deployment

- [x] Personalisasi selesai
- [x] Build successful
- [x] Files finalized (README, CREDITS)
- [ ] Git repository initialized
- [ ] Environment variables prepared
- [ ] Supabase setup complete
- [ ] AI API keys ready

---

## 🔧 Setup Git Repository

```bash
# 1. Initialize git (jika belum)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Project Zulu v1.0.0

- Enhanced fork of Zola by Julien Thibeaut
- MCP integration with tool categorization
- Analytics dashboard
- Enhanced authentication
- Comprehensive testing infrastructure

Credits:
- Original work: Julien Thibeaut (@ibelick)
- Development: Muhammad Nurhidayat Gani with Claude AI
"

# 4. Create repository di GitHub
# Buka https://github.com/new
# Repository name: zulu
# Description: Enhanced AI chat interface with MCP integration

# 5. Add remote
git remote add origin https://github.com/mnhidayatgani/zulu.git

# 6. Push
git branch -M main
git push -u origin main
```

---

## 🌐 Deploy ke Vercel

### Step 1: Login & Import
1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik "New Project"
4. Import `mnhidayatgani/zulu`

### Step 2: Configure Build
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./`
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)
- Node Version: **18.x** or **20.x**

### Step 3: Environment Variables

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
```

**Optional:**
```
ANTHROPIC_API_KEY=sk-ant-xxx...
GOOGLE_GENERATIVE_AI_API_KEY=xxx...
MISTRAL_API_KEY=xxx...
XAI_API_KEY=xxx...
PERPLEXITY_API_KEY=pplx-xxx...
EXA_API_KEY=xxx...
GITHUB_TOKEN=ghp_xxx...
ENCRYPTION_KEY=xxx...
```

### Step 4: Deploy
- Klik "Deploy"
- Wait 2-3 minutes
- Done! 🎉

---

## 📊 Vercel Configuration

### vercel.json (Optional)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["sin1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add domain: `zulu.yourdomain.com`
3. Configure DNS:
   - Type: CNAME
   - Name: zulu
   - Value: cname.vercel-dns.com

---

## 🗄️ Supabase Setup

### Database Tables
Sudah ada schema dari Zola, tapi verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected tables:
-- users, chats, messages, projects, user_keys, user_preferences
```

### RLS Policies
Enable Row Level Security untuk semua tables.

### Storage Buckets
- `chat_attachments` - untuk file uploads

### Authentication
1. Enable Email provider
2. Enable Google OAuth (optional)
3. Configure redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for dev)

---

## �� Post-Deployment Testing

### Test Checklist
```bash
# 1. Homepage loads
curl https://your-app.vercel.app

# 2. Health check
curl https://your-app.vercel.app/api/health

# 3. Models API
curl https://your-app.vercel.app/api/models

# 4. Providers API
curl https://your-app.vercel.app/api/providers
```

### Manual Testing
- [ ] Open site in browser
- [ ] Sign up works
- [ ] Login works
- [ ] Chat dengan AI works
- [ ] File upload works
- [ ] Settings save works
- [ ] Theme switching works
- [ ] MCP server registration works
- [ ] Mobile responsive

---

## 📈 Setup Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In return:
<Analytics />
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🔒 Security Checklist

- [ ] Environment variables tidak di-commit
- [ ] HTTPS enabled (otomatis di Vercel)
- [ ] CSRF protection active
- [ ] Rate limiting configured
- [ ] API keys encrypted (BYOK)
- [ ] RLS policies enabled di Supabase
- [ ] Secure headers configured

---

## 📝 Update GitHub README

Add deployment badge:
```markdown
[![Deployed on Vercel](https://vercel.com/button)](https://your-app.vercel.app)

## 🌐 Live Demo
Visit [zulu.yourdomain.com](https://your-app.vercel.app)
```

Add screenshots di README.

---

## 🎊 Launch Announcement

### GitHub
- [ ] Add repository description
- [ ] Add topics/tags
- [ ] Enable issues
- [ ] Enable discussions
- [ ] Add license badge
- [ ] Add build status badge

### Social Media
- [ ] Twitter/X
- [ ] Reddit (r/opensource, r/nextjs, r/artificial)
- [ ] Hacker News
- [ ] Dev.to
- [ ] Product Hunt (optional)

### Communities
- [ ] Submit to awesome lists
- [ ] Post in Discord communities
- [ ] Share in Slack workspaces

---

## 📊 Analytics & Monitoring

### Setup Google Analytics (Optional)
1. Create GA4 property
2. Get Measurement ID
3. Add to environment variables
4. Install @next/third-parties

### Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

---

## 🐛 Common Issues

### Build Failed
- Check Node.js version (18+)
- Check environment variables
- Check logs in Vercel dashboard

### Database Connection Error
- Verify Supabase URL and keys
- Check IP allowlist in Supabase
- Check RLS policies

### Authentication Not Working
- Check redirect URLs in Supabase
- Verify auth configuration
- Check browser console for errors

---

## 💾 Backup Strategy

### Database Backup
- Supabase: Auto daily backups (paid plans)
- Manual: Export via Supabase dashboard

### Repository Backup
- GitHub: Already backed up
- Additional: Mirror to GitLab/Bitbucket

---

## 🎯 Performance Optimization

### After Deploy
- [ ] Enable Vercel Edge Functions (if needed)
- [ ] Configure ISR (Incremental Static Regeneration)
- [ ] Optimize images
- [ ] Enable compression
- [ ] Setup CDN

### Monitor
- Vercel Speed Insights
- Web Vitals
- Lighthouse scores

---

**Ready to Deploy!** 🚀

Follow checklist step-by-step for successful deployment.
