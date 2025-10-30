# Contact Form Setup Guide

## Overview
The contact form now stores all submissions in your Supabase database, allowing you to view and manage them through the Supabase dashboard.

---

## Setup Instructions

### Step 1: Run the SQL Schema in Supabase

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your ChatBattles project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run the Schema**
   - Open the file: `supabase/contact-schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see a new table called `contact_submissions`

---

## How to View Contact Form Submissions

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Table Editor**
   - Open your Supabase dashboard
   - Click "Table Editor" in the left sidebar
   - Select the `contact_submissions` table

2. **View All Submissions**
   - You'll see all contact form submissions with:
     - Name
     - Email
     - Subject
     - Message
     - Status (unread/read/replied/archived)
     - Created date
     - Updated date

3. **Filter and Search**
   - Use the filter options to find specific submissions
   - Search by email, name, or subject
   - Sort by date (newest first by default)

### Method 2: Using the API (For Admin Dashboard)

You can also fetch submissions programmatically:

```javascript
// Get all submissions
const response = await fetch('/api/contact');
const data = await response.json();

// Get only unread submissions
const response = await fetch('/api/contact?status=unread');
const data = await response.json();

// Get limited number of submissions
const response = await fetch('/api/contact?limit=10');
const data = await response.json();
```

### Method 3: Direct SQL Query

In Supabase SQL Editor, you can run queries like:

```sql
-- Get all unread messages
SELECT * FROM contact_submissions 
WHERE status = 'unread' 
ORDER BY created_at DESC;

-- Get messages from last 7 days
SELECT * FROM contact_submissions 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Count unread messages
SELECT COUNT(*) as unread_count 
FROM contact_submissions 
WHERE status = 'unread';
```

---

## Managing Submissions

### Update Submission Status

You can mark submissions as read, replied, or archived:

```javascript
// Mark as read
await fetch('/api/contact', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'submission-uuid-here',
    status: 'read'
  })
});
```

**Available statuses:**
- `unread` - New submission (default)
- `read` - You've viewed it
- `replied` - You've responded to the user
- `archived` - Resolved/closed

### Manually Update in Supabase Dashboard

1. Go to Table Editor → `contact_submissions`
2. Click on the row you want to update
3. Change the `status` field
4. Click "Save"

---

## Database Schema

### Table: `contact_submissions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `name` | TEXT | Sender's name |
| `email` | TEXT | Sender's email |
| `subject` | TEXT | Message subject/category |
| `message` | TEXT | Message content |
| `status` | TEXT | unread/read/replied/archived |
| `created_at` | TIMESTAMP | When submitted |
| `updated_at` | TIMESTAMP | Last modified |

### Indexes
- `status` - Fast filtering by status
- `created_at` - Fast sorting by date
- `email` - Fast lookup by email

---

## Email Notifications (Optional Future Enhancement)

If you want to receive email notifications when someone submits the form, you can:

1. **Use Supabase Database Webhooks**
   - Set up a webhook to trigger on new inserts
   - Send email via Resend, SendGrid, or similar

2. **Add Email Service to API Route**
   - Modify `app/api/contact/route.ts`
   - Add email sending after successful database insert

3. **Use Supabase Edge Functions**
   - Create a trigger function that sends emails
   - Automatically fires on new submissions

---

## Testing the Form

1. **Visit the Contact Page**
   - Go to `http://localhost:3000/contact` (or your deployed URL)

2. **Fill Out the Form**
   - Enter test data
   - Click "Send Message"

3. **Verify in Supabase**
   - Check the `contact_submissions` table
   - You should see your test submission

4. **Check for Errors**
   - Open browser console (F12)
   - Look for any error messages
   - Check Network tab for API response

---

## Troubleshooting

### Form Submission Fails

**Check 1: Supabase Connection**
```bash
# Verify .env.local has correct values
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Check 2: Table Exists**
- Go to Supabase Table Editor
- Verify `contact_submissions` table exists

**Check 3: RLS Policies**
- The schema includes a policy allowing public inserts
- Verify it's enabled in Supabase → Authentication → Policies

**Check 4: Browser Console**
- Open DevTools (F12)
- Check Console and Network tabs for errors

### Can't View Submissions in Dashboard

**Issue:** RLS policies restrict viewing to service role

**Solution:** Use Supabase dashboard's Table Editor, which uses service role automatically

### Want to Build Admin Dashboard

You can create an admin page to manage submissions:

```typescript
// app/admin/contact/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => setSubmissions(data.submissions));
  }, []);

  return (
    <div>
      <h1>Contact Submissions</h1>
      {submissions.map(sub => (
        <div key={sub.id}>
          <h3>{sub.name} - {sub.email}</h3>
          <p>{sub.message}</p>
          <button onClick={() => markAsRead(sub.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Security Notes

1. **Public Form Submission** - Anyone can submit the form (by design)
2. **RLS Protection** - Only service role can view submissions
3. **Email Validation** - API validates email format
4. **Input Sanitization** - All inputs are trimmed
5. **Rate Limiting** - Consider adding rate limiting for production

---

## API Endpoints

### POST /api/contact
Submit a new contact form

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "general",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": "uuid-here"
}
```

### GET /api/contact
Retrieve submissions (admin only)

**Query Parameters:**
- `status` - Filter by status (unread/read/replied/archived)
- `limit` - Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "submissions": [...],
  "count": 10
}
```

### PATCH /api/contact
Update submission status

**Request:**
```json
{
  "id": "uuid-here",
  "status": "read"
}
```

---

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Test the contact form
3. ✅ Check submissions in Supabase dashboard
4. 🔄 (Optional) Set up email notifications
5. 🔄 (Optional) Build admin dashboard
6. 🔄 (Optional) Add rate limiting

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase credentials in `.env.local`
3. Ensure the SQL schema was run successfully
4. Check Supabase logs in the dashboard
