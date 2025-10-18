# ⚡ Quick Start Guide - ChatBattles.ai

Get ChatBattles.ai running in **5 minutes**!

## Prerequisites

- Node.js 18+ installed
- npm package manager

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

## Environment Variables

Edit `.env.local` with your credentials:

```env
# Get from https://www.a4f.co/
A4F_API_KEY=your_key_here

# Get from https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Get from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

The remaining Clerk variables can stay as-is.

## Database Setup

1. Go to [Supabase Dashboard](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Copy and run the SQL from `supabase/schema.sql`

## Test It Out

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Start Chatting Free"**
3. Sign up with email
4. Enter a prompt like: *"Explain quantum computing in simple terms"*
5. Watch all 3 AI models battle! ⚔️

## Need Help?

- **Full Setup**: See [SETUP.md](SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Documentation**: See [README.md](README.md)

---

**That's it! You're ready to battle! 🔥**

