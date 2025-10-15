# 🚀 Vercel CLI Quick Reference

## Quick Deploy Commands

```bash
# Method 1: Using helper script (EASIEST)
./deploy-vercel.sh

# Method 2: Manual deployment
vercel --prod

# Method 3: Force redeploy
vercel --prod --force
```

## Initial Setup (One-time)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login              # Email or browser
vercel login --github     # Login with GitHub

# Check if logged in
vercel whoami
```

## Environment Variables

### Option A: Via Dashboard (Recommended)
1. Visit: https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add each variable from .env.local
4. Save and redeploy

### Option B: Via CLI
```bash
# Add single variable
vercel env add VARIABLE_NAME production

# Pull environment variables
vercel env pull .env.local

# List environment variables
vercel env ls
```

## Deployment Commands

```bash
# Production deployment
vercel --prod

# Production with confirmation skip
vercel --prod --yes

# Force rebuild
vercel --prod --force

# Deploy to preview (staging)
vercel
```

## Project Management

```bash
# List all projects
vercel ls

# List deployments for current project
vercel ls --scope <your-username>

# Remove project
vercel rm <project-name>
```

## Logs & Debugging

```bash
# View logs for deployment
vercel logs <deployment-url>

# Follow live logs
vercel logs <deployment-url> --follow

# View specific function logs
vercel logs <deployment-url> --since 1h
```

## Domain Management

```bash
# Add custom domain
vercel domains add <domain.com>

# List domains
vercel domains ls

# Remove domain
vercel domains rm <domain.com>
```

## Useful Commands

```bash
# Check CLI version
vercel --version

# Get help
vercel --help
vercel deploy --help

# Link to existing project
vercel link

# Pull project settings
vercel pull
```

## Common Issues & Solutions

### Build Fails
```bash
# Check build logs
vercel logs <url>

# Force clean rebuild
vercel --prod --force

# Check environment variables
vercel env ls
```

### Environment Variables Not Working
```bash
# List all env vars
vercel env ls

# Pull env vars to local
vercel env pull

# Redeploy after adding vars
vercel --prod
```

### Authentication Issues
```bash
# Re-login
vercel logout
vercel login

# Check current user
vercel whoami
```

## Project Zulu Specific

### Required Environment Variables (5)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE
CSRF_SECRET
OPENAI_API_KEY
```

### Optional Environment Variables (4)
```
ANTHROPIC_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
XAI_API_KEY
OPENROUTER_API_KEY
```

### Typical Deployment Flow
```bash
# 1. Login (first time only)
vercel login

# 2. Deploy
cd /root/zola
./deploy-vercel.sh
# OR
vercel --prod

# 3. Add environment variables
# Via dashboard: https://vercel.com/dashboard

# 4. Redeploy with env vars
vercel --prod

# 5. Configure Supabase
# Add redirect URL in Supabase dashboard

# 6. Test deployment
# Visit your deployment URL
```

## Troubleshooting Checklist

- [ ] Vercel CLI installed: `vercel --version`
- [ ] Logged in: `vercel whoami`
- [ ] Environment variables added: `vercel env ls`
- [ ] Git committed and pushed
- [ ] Build passes locally: `npm run build`
- [ ] Supabase redirect URL configured
- [ ] Check deployment logs: `vercel logs`

## Helpful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Project GitHub**: https://github.com/mnhidayatgani/Project-Zulu
- **Supabase Dashboard**: https://supabase.com/dashboard

## Quick Tips

💡 **First deployment might fail** - Add env vars and redeploy
💡 **Use --prod flag** - Ensures production deployment
💡 **Test locally first** - Run `npm run build` before deploying
💡 **Monitor logs** - Use `vercel logs <url>` to debug
💡 **Use helper script** - `./deploy-vercel.sh` for guided deployment

---

**Last Updated**: 2025-10-15  
**Project**: Project Zulu v1.0.0  
**Status**: Ready to deploy! 🚀
