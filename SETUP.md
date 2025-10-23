# ChatBattles.ai - Setup Guide

This guide will walk you through setting up ChatBattles.ai from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git
- Accounts on:
  - [A4F](https://www.a4f.co/)
  - [Clerk](https://clerk.com)
  - [Supabase](https://supabase.com)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up A4F API

1. Go to [https://www.a4f.co/](https://www.a4f.co/)
2. Sign up for an account
3. Navigate to API Keys in your dashboard
4. Create a new API key
5. Copy the API key for the next step

### 3. Set Up Clerk Authentication

1. Go to [https://clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy the following from your dashboard:
   - Publishable Key
   - Secret Key
5. In Clerk Dashboard, configure:
   - **Paths** → Set redirect URLs:
     - After sign in: `/chat`
     - After sign up: `/chat`
   - **Customization** → Optional: customize sign-in/sign-up appearance

### 4. Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)
4. Go to **Settings** → **API**
5. Copy:
   - Project URL
   - Anon/Public Key
6. Go to **SQL Editor**
7. Open the file `supabase/schema.sql` from this project
8. Copy and paste the SQL into Supabase SQL Editor
9. Click "Run" to create the database schema

### 5. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:

   ```env
   # A4F API Configuration
   A4F_API_KEY=your_a4f_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Clerk Configuration
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
   ```

### 6. Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

### 7. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Start Chatting Free" or "Sign Up"
3. Create a test account
4. Try sending a prompt in Battle Mode
5. Check that all 4 AI models respond
6. Visit the Profile page to see your chat history

## Troubleshooting

### Issue: "API key not found"
**Solution**: Make sure your `.env.local` file exists and contains the A4F_API_KEY. Restart your dev server after adding environment variables.

### Issue: Clerk authentication not working
**Solution**: 
- Verify your Clerk keys are correct
- Make sure the redirect URLs are configured in Clerk dashboard
- Clear browser cookies and try again

### Issue: Database connection error
**Solution**:
- Verify your Supabase URL and anon key are correct
- Make sure the `chats` table was created (check in Supabase Table Editor)
- If using RLS policies, you may need to disable them during development

### Issue: AI models not responding
**Solution**:
- Check your A4F API key is valid
- Verify you have credits/access to the models
- Check browser console for error messages
- Try with a simpler prompt first

### Issue: Build errors
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

## Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local`)
5. Click "Deploy"

### 3. Update Clerk Redirect URLs

After deployment, update your Clerk application settings:
- Production URL: `https://your-app.vercel.app`
- Update redirect URLs to use your production domain

## Optional Enhancements

### Add a Custom Domain

1. In Vercel, go to your project settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update Clerk URLs to use custom domain

### Disable Supabase RLS (if needed)

If you're having issues with Supabase Row Level Security:

```sql
alter table chats disable row level security;
```

Run this in Supabase SQL Editor.

### Add More AI Models

Edit `lib/a4fClient.ts` and add more models to the `AI_MODELS` array:

```typescript
export const AI_MODELS = [
  { id: "provider-3/gpt-5-nano", name: "GPT-5-Nano", color: "orange" },
  { id: "provider-5/grok-4-0709", name: "Grok-4", color: "red" },
  { id: "provider-1/deepseek-v3.1", name: "DeepSeek v3.1", color: "amber" },
  // Add more models here
];
```

## Need Help?

- Check the main [README.md](README.md)
- Open an issue on GitHub
- Review the [Next.js Documentation](https://nextjs.org/docs)
- Check [Clerk Documentation](https://clerk.com/docs)
- Review [Supabase Documentation](https://supabase.com/docs)

---

**You're all set! Enjoy building with ChatBattles.ai** 🔥⚔️

