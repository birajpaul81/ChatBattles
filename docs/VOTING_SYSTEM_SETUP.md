# Voting System Setup Guide

This guide explains how to set up and use the voting persistence system in ChatBattles.

## Overview

The voting system allows users to vote on AI model responses, and tracks which models are most popular across all users. Votes are persisted to the database and can be viewed in real-time statistics.

## Features

✅ **Vote Persistence** - All votes saved to Supabase database  
✅ **Real-time Statistics** - View which AI models are most popular  
✅ **User-specific Tracking** - Each user can vote once per model per chat  
✅ **Vote Updates** - Users can change their votes (up/down toggle)  
✅ **Beautiful UI** - Modal with statistics, approval rates, and rankings  
✅ **Automatic Ranking** - Models sorted by score (upvotes - downvotes)

## Setup Instructions

### Step 1: Create Database Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the SQL script from `supabase/votes-schema.sql`:

```sql
-- This creates the votes table with proper indexes and RLS policies
-- See: supabase/votes-schema.sql
```

**Important:** If you're using Clerk (not Supabase Auth), you may need to disable RLS:

```sql
alter table votes disable row level security;
```

### Step 2: Verify Environment Variables

Ensure your `.env.local` has the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test the System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the chat page (`/chat`)

3. Submit a prompt to get AI responses

4. Click the thumbs up/down buttons on any model card

5. Click the **"Stats"** button to view vote statistics

## How It Works

### Database Schema

**votes table:**
- `id` (uuid) - Primary key
- `user_id` (text) - Clerk user ID
- `chat_id` (uuid) - Reference to chats table
- `model` (text) - AI model identifier
- `vote_type` (text) - 'up' or 'down'
- `created_at` (timestamp) - When vote was created

**Unique constraint:** One vote per user per chat per model

### API Endpoints

#### POST `/api/votes`
Save or update a vote:
```typescript
{
  chatId: string,
  model: string,
  voteType: "up" | "down"
}
```

Response:
```typescript
{
  success: boolean,
  data: Vote,
  updated: boolean  // true if existing vote was updated
}
```

#### GET `/api/votes`
Get vote statistics:

Query parameters (all optional):
- `model` - Filter by specific model
- `chatId` - Filter by specific chat
- `userId` - Filter by specific user

Response:
```typescript
{
  success: boolean,
  stats: {
    [model: string]: {
      up: number,
      down: number,
      total: number,
      score: number,        // up - down
      percentage: number    // (up / total) * 100
    }
  },
  totalVotes: number
}
```

#### DELETE `/api/votes`
Remove a vote:

Query parameters:
- `id` - Vote ID, OR
- `chatId` + `model` - Chat and model combination

### Vote Flow

1. **User submits prompt** → Chat saved to database with ID
2. **Chat ID stored** → Used for vote persistence
3. **User clicks vote button** → Local state updates immediately (optimistic UI)
4. **Vote saved to database** → API call persists vote
5. **View statistics** → Click "Stats" button to see all votes

### Vote Statistics Display

The `VoteStats` component shows:

- **Total votes** across all models
- **Per-model statistics:**
  - Upvotes and downvotes
  - Net score (upvotes - downvotes)
  - Approval rate percentage
  - Visual progress bar
  - Trophy icon for #1 ranked model
- **Real-time updates** when modal is opened
- **Color-coded** by model (matches BattleCard colors)

## Usage Examples

### Query Most Voted Model

```typescript
const response = await fetch("/api/votes");
const { stats } = await response.json();

// Models are already sorted by score (highest first)
const topModel = Object.keys(stats)[0];
console.log(`Most voted model: ${topModel}`);
console.log(`Score: ${stats[topModel].score}`);
console.log(`Approval: ${stats[topModel].percentage}%`);
```

### Get Votes for Specific Model

```typescript
const response = await fetch("/api/votes?model=provider-3/gpt-5-nano");
const { stats } = await response.json();

console.log(stats["provider-3/gpt-5-nano"]);
// { up: 45, down: 5, total: 50, score: 40, percentage: 90 }
```

### Get User's Votes

```typescript
const response = await fetch(`/api/votes?userId=${userId}`);
const { stats, totalVotes } = await response.json();

console.log(`User has cast ${totalVotes} votes`);
```

## Troubleshooting

### Votes Not Saving

**Issue:** Votes show "local only" message

**Solution:**
1. Check that chat is being saved successfully (check console logs)
2. Verify `currentChatId` is set after chat save
3. Check Supabase connection and credentials
4. Verify votes table exists in database

### RLS Policy Errors

**Issue:** "new row violates row-level security policy"

**Solution:**
1. If using Clerk (not Supabase Auth), disable RLS:
   ```sql
   alter table votes disable row level security;
   ```
2. Or update RLS policies to work with Clerk's JWT format

### Statistics Not Loading

**Issue:** Stats modal shows "No votes recorded yet"

**Solution:**
1. Check browser console for API errors
2. Verify votes table has data: `SELECT * FROM votes;`
3. Check API endpoint is accessible: `/api/votes`
4. Verify Supabase service role key is correct

### Duplicate Vote Errors

**Issue:** "duplicate key value violates unique constraint"

**Solution:**
- This is expected behavior - the API automatically updates existing votes
- Check that the API is using UPSERT logic (update if exists, insert if new)

## Model Identifiers

Current AI models and their identifiers:

- **GPT-5-Nano**: `provider-3/gpt-5-nano` (Orange)
- **Llama-4 Scout**: `provider-3/llama-4-scout` (Red)
- **DeepSeek v3.1**: `provider-1/deepseek-v3.1` (Amber)
- **Gemini 2.5 Flash**: `provider-3/gemini-2.5-flash-lite-preview-09-2025` (Blue)

## Files Modified/Created

### New Files
- `supabase/votes-schema.sql` - Database schema
- `app/api/votes/route.ts` - API endpoints
- `components/VoteStats.tsx` - Statistics modal component
- `VOTING_SYSTEM_SETUP.md` - This guide

### Modified Files
- `app/chat/page.tsx` - Added vote persistence logic and Stats button
- Database schema now includes votes table

## Future Enhancements

Potential improvements:
- [ ] Vote history timeline
- [ ] Trending models over time
- [ ] Category-based statistics (coding, creative, etc.)
- [ ] Export statistics as CSV/JSON
- [ ] Admin dashboard for vote analytics
- [ ] Vote-based model recommendations
- [ ] Leaderboard with time filters (today, week, month, all-time)

## Support

If you encounter issues:
1. Check console logs in browser DevTools
2. Check Supabase logs in dashboard
3. Verify all environment variables are set
4. Ensure database migrations are applied
5. Test API endpoints directly using tools like Postman

---

**Last Updated:** October 28, 2025  
**Version:** 1.0.0
