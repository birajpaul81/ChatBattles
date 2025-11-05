# Admin Dashboard Setup Guide 🎛️

> **Monitor your API usage, rate limits, costs, and fallback usage in real-time**

---

## 🎯 What You Get

Your **private admin dashboard** shows:

✅ **Real-time Stats**
- Total requests today
- Requests this hour
- Rate limit hits
- Fallback usage
- Cost tracking

✅ **Rate Limit Monitoring**
- OpenRouter free tier (20/min, 200/day, 100K tokens/day)
- A4F API limits (60/min, 1000/day)
- User rate limits (100 battles/day, 200 chats/day)
- Visual progress bars with color coding

✅ **Model Performance**
- Requests per model
- Fallback usage per model
- Error rate per model
- Average response time
- Status indicators

✅ **Hourly Breakdown**
- Last 24 hours chart
- Primary vs fallback requests
- Visual bar graph

✅ **Recent Requests**
- Last 20 requests
- Model used
- Fallback indicator
- Error indicator
- Response time

✅ **Auto-refresh**
- Updates every 30 seconds
- Toggle on/off
- Manual refresh button

---

## 🚀 Setup Instructions

### Step 1: Get Your Clerk User ID

1. Go to your Clerk Dashboard
2. Click on "Users" in the sidebar
3. Find your account
4. Copy your **User ID** (starts with `user_`)

Example: `user_2abc123def456ghi789jkl`

### Step 2: Update Admin Page

Edit `app/admin/page.tsx`:

```typescript
// Line 13 - REPLACE WITH YOUR CLERK USER ID
const ADMIN_USER_ID = 'user_YOUR_ID_HERE';
```

### Step 3: Update API Route

Edit `app/api/admin/stats/route.ts`:

```typescript
// Line 11 - REPLACE WITH YOUR CLERK USER ID
const ADMIN_USER_ID = 'user_YOUR_ID_HERE';
```

### Step 4: Run Database Migration

Run the SQL migration to create the `api_logs` table:

```bash
# Option 1: Via Supabase MCP (if connected)
# The migration will be run automatically

# Option 2: Via Supabase Dashboard
1. Go to Supabase SQL Editor
2. Copy contents of: supabase/migrations/20250116_api_logs.sql
3. Paste and click "Run"
```

### Step 5: Verify Setup

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/admin`
3. You should see the dashboard!

---

## 📊 Understanding the Dashboard

### Key Metrics Cards

**1. Requests Today**
- Total API calls made today
- Shows requests in last hour below

**2. Rate Limit Hits**
- How many times users hit rate limits
- Percentage of total requests

**3. Fallback Requests**
- How many times fallback was used
- Indicates A4F availability

**4. Cost Today**
- Total cost (should be $0 on free tier)
- Cost per request

### Rate Limit Status

**Color Coding:**
- 🟢 **Green (0-70%):** Safe zone
- 🟡 **Yellow (70-90%):** Warning zone
- 🔴 **Red (90-100%):** Danger zone!

**OpenRouter Free Tier Limits:**
- 20 requests per minute
- 200 requests per day
- 100,000 tokens per day

**A4F Limits:**
- 60 requests per minute
- 1,000 requests per day

**User Limits:**
- 100 battles per day
- 100 requests per hour

### Model Performance Table

**Columns:**
- **Model:** AI model name
- **Requests:** Total requests to this model
- **Fallbacks:** How many used fallback
- **Errors:** How many failed
- **Avg Response:** Average response time in seconds
- **Status:** ✅ (working) or ❌ (errors)

### Hourly Breakdown Chart

- **Blue bars:** Primary requests (A4F, Groq, Google)
- **Orange bars:** Fallback requests (OpenRouter)
- Shows last 24 hours
- Hover to see exact numbers

### Recent Requests

- **Timestamp:** When the request was made
- **Model Name:** Which AI model
- **Fallback badge:** Orange if fallback was used
- **Error badge:** Red if request failed
- **Response Time:** How long it took

---

## 🔔 Rate Limit Warnings

### When to Worry

**OpenRouter:**
- ⚠️ **80%+ of daily limit:** Slow down usage
- 🚨 **90%+ of daily limit:** Critical! Stop non-essential requests
- 🔴 **100%:** Hit limit, wait for reset (24 hours)

**A4F:**
- ⚠️ **80%+ of daily limit:** Monitor closely
- 🚨 **90%+ of daily limit:** Consider adding more fallbacks
- 🔴 **100%:** Hit limit, fallbacks will activate

**Actions to Take:**
1. Check if there's unusual traffic
2. Verify no spam or abuse
3. Consider lowering user rate limits temporarily
4. Add more free tier fallbacks (Claude, Mistral)

---

## 💡 Pro Tips

### 1. Monitor Fallback Rate

**Healthy:** <20% fallback rate
- A4F is working well
- Good primary availability

**Warning:** 20-50% fallback rate
- A4F having some issues
- Monitor for patterns

**Critical:** >50% fallback rate
- A4F might be down
- Check A4F status page
- Consider adding more fallbacks

### 2. Watch Response Times

**Good:** <3 seconds average
**Acceptable:** 3-5 seconds
**Slow:** >5 seconds
- Check if specific model is slow
- Consider removing slow models
- Verify internet connection

### 3. Track Errors

**Acceptable:** <5% error rate
**High:** >5% error rate
- Check error messages
- Verify API keys are valid
- Check provider status pages

### 4. Cost Monitoring

**Free Tier:** Should always be $0.00
**If costs appear:**
- Check if accidentally using paid tier
- Verify all models use free fallbacks
- Review API keys

---

## 🛠️ Troubleshooting

### Dashboard Shows "Unauthorized"

**Problem:** Your User ID doesn't match
**Solution:**
1. Double-check your Clerk User ID
2. Update both files (admin/page.tsx and api/admin/stats/route.ts)
3. Restart dev server

### No Data Showing

**Problem:** No requests logged yet
**Solution:**
1. Make a test request (visit /chat, send a message)
2. Refresh admin dashboard
3. Check Supabase for api_logs table

### "Failed to fetch stats" Error

**Problem:** Database migration not run
**Solution:**
1. Run the migration: `supabase/migrations/20250116_api_logs.sql`
2. Verify table exists in Supabase
3. Check Supabase connection

### Auto-refresh Not Working

**Problem:** Browser might be blocking
**Solution:**
1. Check browser console for errors
2. Try manual refresh button
3. Toggle auto-refresh off and on

---

## 📈 Usage Patterns to Watch

### Normal Pattern
- Steady requests throughout the day
- Low fallback rate (<20%)
- Low error rate (<5%)
- Consistent response times

### Spike Pattern
- Sudden increase in requests
- Could indicate viral traffic
- Monitor rate limits closely
- Consider temporary rate limit reduction

### High Fallback Pattern
- Many fallback requests
- A4F might be having issues
- Check A4F status
- Fallbacks are working as designed!

### Error Pattern
- Many errors from specific model
- Check that model's API key
- Verify provider status
- Consider temporarily disabling that model

---

## 🔐 Security Notes

### Admin Access Only

**Important:**
- Only YOU can access `/admin`
- Protected by Clerk User ID check
- No other users can see this data
- Keep your User ID private

**If you need multiple admins:**
1. Get their Clerk User IDs
2. Update the check to allow multiple IDs:

```typescript
const ADMIN_USER_IDS = [
  'user_YOUR_ID',
  'user_ADMIN2_ID',
  'user_ADMIN3_ID',
];

if (!ADMIN_USER_IDS.includes(user.id)) {
  router.push('/');
}
```

---

## 📊 Database Schema

### api_logs Table

```sql
CREATE TABLE api_logs (
  id UUID PRIMARY KEY,
  user_id TEXT,              -- Clerk user ID
  ip_address TEXT,           -- Client IP
  model_name TEXT,           -- AI model used
  provider TEXT,             -- 'a4f', 'openrouter', 'groq', 'google'
  used_fallback BOOLEAN,     -- Whether fallback was used
  rate_limited BOOLEAN,      -- Whether hit rate limit
  error BOOLEAN,             -- Whether request failed
  error_message TEXT,        -- Error details
  response_time DECIMAL,     -- Response time in seconds
  tokens_used INTEGER,       -- Tokens consumed
  cost DECIMAL,              -- Cost in USD
  created_at TIMESTAMP       -- When request was made
);
```

### Automatic Cleanup

Old logs (>30 days) are automatically cleaned up to save space.

Manual cleanup:
```sql
SELECT cleanup_old_api_logs();
```

---

## 🎯 Next Steps

### After Setup

1. ✅ **Test the dashboard**
   - Make some test requests
   - Verify data appears
   - Check all metrics

2. ✅ **Set up monitoring routine**
   - Check dashboard daily
   - Monitor rate limits
   - Track fallback usage

3. ✅ **Plan for scale**
   - Watch for patterns
   - Adjust rate limits as needed
   - Add more fallbacks if needed

### Future Enhancements

**Possible additions:**
- Email alerts when rate limits hit 80%
- Daily usage reports
- Cost projections
- User analytics
- Model comparison charts
- Export data to CSV
- Custom date ranges
- Webhook notifications

---

## 📞 Need Help?

**Common Questions:**

**Q: Can users see this dashboard?**
A: No! Only you (admin) can access it.

**Q: Does logging slow down requests?**
A: No, logging is async and doesn't block responses.

**Q: How long is data stored?**
A: 30 days, then automatically cleaned up.

**Q: Can I export the data?**
A: Yes! Query Supabase directly or add export feature.

**Q: What if I hit rate limits?**
A: Fallbacks activate automatically. Add more free tier models.

---

## 🎉 You're All Set!

Your admin dashboard is ready to help you:
- ✅ Monitor API usage in real-time
- ✅ Track rate limits before hitting them
- ✅ See fallback usage patterns
- ✅ Identify errors quickly
- ✅ Keep costs at $0

**Access your dashboard:** `http://localhost:3000/admin`

**Stay in control of your API usage! 🚀**
