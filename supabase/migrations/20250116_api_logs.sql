-- Create api_logs table for tracking all API requests
-- This table is used for admin dashboard monitoring

CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,                           -- Clerk user ID (null for anonymous)
  ip_address TEXT,                        -- Client IP address
  model_name TEXT NOT NULL,               -- AI model used
  provider TEXT,                          -- 'a4f', 'openrouter', 'groq', 'google'
  used_fallback BOOLEAN DEFAULT false,    -- Whether fallback was used
  rate_limited BOOLEAN DEFAULT false,     -- Whether request hit rate limit
  error BOOLEAN DEFAULT false,            -- Whether request had an error
  error_message TEXT,                     -- Error details if any
  response_time DECIMAL(10, 3),           -- Response time in seconds
  tokens_used INTEGER,                    -- Tokens consumed
  cost DECIMAL(10, 6) DEFAULT 0,          -- Cost in USD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_model ON public.api_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_fallback ON public.api_logs(used_fallback);
CREATE INDEX IF NOT EXISTS idx_api_logs_error ON public.api_logs(error);

-- Enable Row Level Security
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage api_logs"
  ON public.api_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own api_logs"
  ON public.api_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create function to clean up old logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get hourly stats
CREATE OR REPLACE FUNCTION get_hourly_stats(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  hour TIMESTAMP WITH TIME ZONE,
  total_requests BIGINT,
  fallback_requests BIGINT,
  error_requests BIGINT,
  avg_response_time DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('hour', created_at) as hour,
    COUNT(*) as total_requests,
    SUM(CASE WHEN used_fallback THEN 1 ELSE 0 END) as fallback_requests,
    SUM(CASE WHEN error THEN 1 ELSE 0 END) as error_requests,
    AVG(response_time) as avg_response_time
  FROM public.api_logs
  WHERE created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY date_trunc('hour', created_at)
  ORDER BY hour DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get model stats
CREATE OR REPLACE FUNCTION get_model_stats(days_back INTEGER DEFAULT 1)
RETURNS TABLE (
  model_name TEXT,
  total_requests BIGINT,
  fallback_requests BIGINT,
  error_requests BIGINT,
  avg_response_time DECIMAL,
  total_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    api_logs.model_name,
    COUNT(*) as total_requests,
    SUM(CASE WHEN used_fallback THEN 1 ELSE 0 END) as fallback_requests,
    SUM(CASE WHEN error THEN 1 ELSE 0 END) as error_requests,
    AVG(response_time) as avg_response_time,
    SUM(cost) as total_cost
  FROM public.api_logs
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY api_logs.model_name
  ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.api_logs IS 'Tracks all API requests for monitoring and analytics';
COMMENT ON COLUMN public.api_logs.user_id IS 'Clerk user ID for authenticated users, null for anonymous';
COMMENT ON COLUMN public.api_logs.model_name IS 'AI model used (GPT-5, Llama-4, DeepSeek, etc.)';
COMMENT ON COLUMN public.api_logs.provider IS 'API provider used (a4f, openrouter, groq, google)';
COMMENT ON COLUMN public.api_logs.used_fallback IS 'Whether fallback provider was used';
COMMENT ON COLUMN public.api_logs.rate_limited IS 'Whether request hit rate limit';
COMMENT ON COLUMN public.api_logs.error IS 'Whether request resulted in an error';
COMMENT ON COLUMN public.api_logs.response_time IS 'Response time in seconds';
COMMENT ON COLUMN public.api_logs.tokens_used IS 'Number of tokens consumed';
COMMENT ON COLUMN public.api_logs.cost IS 'Cost in USD (0 for free tier)';
