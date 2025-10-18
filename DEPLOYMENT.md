# Deployment Guide for ChatBattles.ai

This guide covers deploying ChatBattles.ai to production using Vercel.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ All environment variables configured
- ✅ Supabase database schema created
- ✅ Clerk application set up
- ✅ A4F API key obtained
- ✅ Code pushed to GitHub/GitLab/Bitbucket
- ✅ Tested locally (`npm run build` succeeds)

## Deploy to Vercel (Recommended)

### Step 1: Push to Git Repository

```bash
git init
git add .
git commit -m "Initial commit - ChatBattles.ai"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

**Production Environment Variables:**

```
A4F_API_KEY=your_production_a4f_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete (2-3 minutes).

### Step 5: Update Clerk URLs

After deployment, your site will be live at `https://your-app.vercel.app`

1. Go to your Clerk Dashboard
2. Navigate to **Paths** settings
3. Update the following:
   - **Home URL**: `https://your-app.vercel.app`
   - **Sign-in URL**: `https://your-app.vercel.app/sign-in`
   - **Sign-up URL**: `https://your-app.vercel.app/sign-up`
   - **After sign-in**: `https://your-app.vercel.app/chat`
   - **After sign-up**: `https://your-app.vercel.app/chat`

### Step 6: Test Your Deployment

1. Visit your deployed URL
2. Sign up with a test account
3. Try sending a prompt in Battle Mode
4. Verify all 3 AI models respond
5. Check profile page and chat history

## Custom Domain Setup

### Add Custom Domain

1. In Vercel, go to **Project Settings** → **Domains**
2. Add your domain (e.g., `chatbattles.ai`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours, usually 5-10 minutes)

### Update Clerk for Custom Domain

1. Go to Clerk Dashboard
2. Update all URLs to use your custom domain
3. Example: `https://chatbattles.ai` instead of `https://your-app.vercel.app`

## Environment Management

### Development, Preview, and Production

Vercel automatically creates three environments:

1. **Development**: When you run `npm run dev` locally
2. **Preview**: Automatic deployments for pull requests
3. **Production**: Deployments from your main branch

You can set different environment variables for each environment in Vercel.

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets and API responses. No additional configuration needed.

### Edge Functions

Your API routes run as serverless functions by default. They're automatically optimized for low latency.

### Monitoring

1. Go to Vercel Dashboard → **Analytics**
2. Monitor:
   - Page views
   - Response times
   - Error rates
   - User traffic

## Troubleshooting Production Issues

### Build Fails

**Check build logs in Vercel:**
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors
- Check that all environment variables are set

**Common fixes:**
```bash
# Locally test the build
npm run build

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard → **Deployments**
2. Click on your deployment
3. View **Function Logs**

**Common issues:**
- Missing environment variables
- API rate limits exceeded
- Database connection errors

### Authentication Issues

**Clerk not working:**
1. Verify Clerk environment variables are set
2. Check that redirect URLs match your domain
3. Ensure Clerk application is in production mode
4. Clear browser cookies and try again

### Database Issues

**Supabase connection errors:**
1. Verify Supabase URL and anon key
2. Check RLS policies aren't blocking requests
3. Verify database schema is created
4. Check Supabase service status

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you:
- Push to your main branch (Production)
- Create a pull request (Preview)

### Manual Deployments

To manually trigger a deployment:
1. Go to Vercel Dashboard
2. Click **"Deployments"**
3. Click **"Redeploy"** on any previous deployment

### Rollback

To rollback to a previous version:
1. Go to **Deployments**
2. Find the working deployment
3. Click **"⋯"** → **"Promote to Production"**

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use strong, unique API keys
- ✅ Rotate keys periodically
- ✅ Use Vercel environment variables, not hardcoded values

### API Routes
- ✅ Always validate user input
- ✅ Use Clerk authentication middleware
- ✅ Rate limit API endpoints if needed
- ✅ Handle errors gracefully

### Database
- ✅ Enable Row Level Security (RLS) in Supabase
- ✅ Use parameterized queries
- ✅ Limit query results
- ✅ Back up your database regularly

## Scaling

### Vercel Pro Features

As your app grows, consider upgrading to Vercel Pro for:
- Higher function execution limits
- More concurrent builds
- Advanced analytics
- Priority support

### Database Scaling

Monitor Supabase usage:
- Database size
- API request count
- Bandwidth usage

Upgrade Supabase plan as needed.

### API Rate Limits

Monitor A4F API usage:
- Request count
- Token usage
- Error rates

Consider implementing:
- Request caching
- Rate limiting per user
- Queue system for high traffic

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics for:
- Real-time visitor data
- Performance metrics
- Core Web Vitals

### Error Tracking

Consider integrating error tracking:
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- [Datadog](https://www.datadoghq.com/)

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

## Costs

### Free Tier Limits

**Vercel Free:**
- 100 GB bandwidth/month
- 100 hours serverless function execution
- 6,000 builds/month

**Supabase Free:**
- 500 MB database
- 1 GB bandwidth
- 50 MB file storage

**Clerk Free:**
- 10,000 monthly active users
- All features included

**A4F:** Check their pricing page for API costs

### Estimated Costs

For 1,000 monthly active users:
- Vercel: Free or $20/month (Pro)
- Supabase: Free or $25/month (Pro)
- Clerk: Free
- A4F: Varies by usage

## Support

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Clerk Support**: [clerk.com/support](https://clerk.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **GitHub Issues**: Open an issue in your repository

---

**Congratulations! Your ChatBattles.ai is now live!** 🚀⚔️

For updates and maintenance, see the main [README.md](README.md)

