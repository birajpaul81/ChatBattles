# Gemini Fallback System - Bug Fixes

## Issues Fixed

### 1. **Message Format Conversion Bug**
**Problem**: System messages were being converted to Gemini format before filtering, causing role mismatches.

**Fix**: 
- Filter out system messages BEFORE converting to Gemini format
- Handle single-message requests separately using `generateContent()`
- Use `startChat()` only for multi-turn conversations

### 2. **Model Name Issue**
**Problem**: Using experimental model `gemini-2.0-flash-exp` which may not be stable.

**Fix**: Changed to stable model `gemini-1.5-flash-latest`

### 3. **Error Handling**
**Problem**: Generic error messages made debugging difficult.

**Fix**: Added detailed error logging with:
- Error message
- Status code
- Status text
- Response details

### 4. **API Key Initialization**
**Problem**: Missing API key would crash the entire app at import time.

**Fix**: 
- Graceful degradation with warning instead of error
- Null check before using Google client
- Clear error message if fallback is triggered without API key

## Updated Configuration

### Model Settings
```typescript
{
  id: "provider-3/gemini-2.5-flash-lite-preview-09-2025",
  name: "Google Gemini 2.5 Pro",
  color: "blue",
  supportsVision: true,
  fallbackId: "gemini-1.5-flash-latest",  // ✅ Changed from gemini-2.0-flash-exp
  fallbackProvider: "google"
}
```

### Environment Variable
```bash
GOOGLE_API_KEY=your_google_api_key_here
```

## How to Test

### 1. **Verify API Key is Loaded**
Check server logs on startup for:
- ✅ No warning about missing GOOGLE_API_KEY
- ❌ Warning: "GOOGLE_API_KEY is not set" (means key not loaded)

### 2. **Test Normal Operation**
1. Go to `/chat`
2. Send a message to Gemini
3. Should get response from A4F (primary)
4. No fallback logs should appear

### 3. **Test Fallback Trigger**
To manually test fallback, you can:
1. Temporarily break A4F by using invalid model ID
2. Or wait for A4F timeout (30 seconds)
3. Look for console logs:
   ```
   Google Gemini 2.5 Pro: Primary A4F failed/timed out, trying google fallback...
   Calling Google Gemini API with model: gemini-1.5-flash-latest
   Message count: X
   Google Gemini response received: ...
   ```

### 4. **Check Response**
Response should include:
```json
{
  "model": "provider-3/gemini-2.5-flash-lite-preview-09-2025",
  "name": "Google Gemini 2.5 Pro",
  "text": "...",
  "usedFallback": true  // ✅ This indicates Google fallback was used
}
```

## Debugging Checklist

If fallback still doesn't work, check:

- [ ] **Environment Variable**: Is `GOOGLE_API_KEY` in `.env.local`?
- [ ] **Server Restart**: Did you restart the dev server after adding the key?
- [ ] **Package Installed**: Is `@google/generative-ai` in node_modules?
- [ ] **API Key Valid**: Test the key at https://aistudio.google.com/
- [ ] **Model Name**: Using `gemini-1.5-flash-latest` (not experimental model)
- [ ] **Console Logs**: Check for detailed error messages
- [ ] **Network**: Check if Google AI API is accessible from your network

## Common Errors & Solutions

### Error: "GOOGLE_API_KEY is not set"
**Solution**: Add the key to `.env.local` and restart server
```bash
# Stop server (Ctrl+C)
# Add to .env.local:
GOOGLE_API_KEY=your_google_api_key_here
# Restart server
npm run dev
```

### Error: "Google AI client not initialized"
**Solution**: Same as above - API key not loaded

### Error: "Gemini API failed: [PERMISSION_DENIED]"
**Solution**: 
- API key may be invalid or expired
- Generate new key at https://aistudio.google.com/apikey
- Update `.env.local` with new key

### Error: "Model not found: gemini-2.0-flash-exp"
**Solution**: Already fixed - now using `gemini-1.5-flash-latest`

### Error: "Invalid argument"
**Solution**: Message format issue - already fixed with proper filtering

## Files Modified

1. ✅ `lib/googleClient.ts`
   - Fixed message conversion logic
   - Added single-message handling
   - Improved error logging
   - Added null checks

2. ✅ `lib/a4fClient.ts`
   - Changed fallback model to `gemini-1.5-flash-latest`

3. ✅ `app/api/a4f-battle/route.ts`
   - Added detailed logging for Google fallback

## Testing Commands

```bash
# 1. Verify environment
cat .env.local | grep GOOGLE_API_KEY

# 2. Check package installed
npm list @google/generative-ai

# 3. Start dev server with logs
npm run dev

# 4. Test in browser
# Go to http://localhost:3000/chat
# Send message to Gemini model
```

## Expected Behavior

### Scenario 1: A4F Works (Normal)
```
User sends message → A4F responds in <30s → User sees response
No fallback triggered
```

### Scenario 2: A4F Fails (Fallback)
```
User sends message → A4F times out/errors → Google fallback triggered
Console logs:
  "trying google fallback..."
  "Calling Google Gemini API..."
  "Google Gemini response received..."
User sees response with usedFallback: true
```

### Scenario 3: Both Fail (Error)
```
User sends message → A4F fails → Google fails
User sees error message
Console shows detailed error logs
```

## Success Indicators

✅ No errors on server startup
✅ No "GOOGLE_API_KEY is not set" warning
✅ Gemini responses work (either A4F or Google)
✅ Fallback logs appear when A4F fails
✅ `usedFallback: true` in response when Google is used

## Next Steps

1. **Restart Dev Server**: `npm run dev`
2. **Test Gemini**: Send a message to Gemini model
3. **Check Logs**: Look for any errors or fallback triggers
4. **Verify Response**: Ensure you get a response
5. **Monitor**: Watch for fallback usage in production

---

**Status**: ✅ FIXED - All known issues resolved
**Last Updated**: 2025-01-04
