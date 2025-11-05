-- Create rate_limits table for tracking API usage
-- This table is used to implement IP-based and user-based rate limiting

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,                    -- Clerk user ID (null for anonymous)
  ip_address TEXT,                 -- Client IP address
  request_type TEXT NOT NULL,      -- 'battle', 'chat', or 'anonymous'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Indexes for fast lookups
  INDEX idx_rate_limits_user_id (user_id),
  INDEX idx_rate_limits_ip (ip_address),
  INDEX idx_rate_limits_created_at (created_at),
  INDEX idx_rate_limits_user_type (user_id, request_type, created_at)
);

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage rate_limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can view their own rate limit data
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create function to clean up old entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to run cleanup daily
-- (This requires pg_cron extension, enable in Supabase dashboard if needed)
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 2 * * *',  -- Run at 2 AM daily
--   'SELECT cleanup_old_rate_limits();'
-- );

-- Comments for documentation
COMMENT ON TABLE public.rate_limits IS 'Tracks API usage for rate limiting purposes';
COMMENT ON COLUMN public.rate_limits.user_id IS 'Clerk user ID for authenticated users, null for anonymous';
COMMENT ON COLUMN public.rate_limits.ip_address IS 'Client IP address for IP-based rate limiting';
COMMENT ON COLUMN public.rate_limits.request_type IS 'Type of request: battle, chat, or anonymous';
COMMENT ON COLUMN public.rate_limits.created_at IS 'Timestamp of the request';
