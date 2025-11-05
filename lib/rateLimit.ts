/**
 * Rate Limiting System for ChatBattles AI
 * 
 * Protects API endpoints from abuse and controls costs
 * - IP-based rate limiting for anonymous users
 * - User-based rate limiting for logged-in users
 * - Tracks usage in Supabase
 * - Shows remaining quota to users
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limit configurations
export const RATE_LIMITS = {
  // Anonymous users (IP-based)
  ANONYMOUS_PER_HOUR: 50,
  ANONYMOUS_PER_DAY: 100,
  
  // Logged-in users (user-based)
  USER_BATTLES_PER_DAY: 100,
  USER_CHATS_PER_DAY: 200,
  USER_PER_HOUR: 100,
  
  // Anti-spam measures
  MIN_REQUEST_INTERVAL_MS: 1000, // 1 second between requests
  MAX_CONSECUTIVE_FAILURES: 10,
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  message?: string;
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Check IP-based rate limit for anonymous users
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Get requests in the last hour
    const { data: hourlyRequests, error: hourError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .gte('created_at', hourAgo.toISOString());

    if (hourError) throw hourError;

    const hourlyCount = hourlyRequests?.length || 0;

    // Check hourly limit
    if (hourlyCount >= RATE_LIMITS.ANONYMOUS_PER_HOUR) {
      const oldestRequest = hourlyRequests?.[0];
      const resetAt = oldestRequest 
        ? new Date(new Date(oldestRequest.created_at).getTime() + 60 * 60 * 1000)
        : new Date(now.getTime() + 60 * 60 * 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: RATE_LIMITS.ANONYMOUS_PER_HOUR,
        resetAt,
        message: 'Hourly rate limit exceeded. Please try again later or sign in for higher limits.',
      };
    }

    // Get requests in the last day
    const { data: dailyRequests, error: dayError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .gte('created_at', dayAgo.toISOString());

    if (dayError) throw dayError;

    const dailyCount = dailyRequests?.length || 0;

    // Check daily limit
    if (dailyCount >= RATE_LIMITS.ANONYMOUS_PER_DAY) {
      const oldestRequest = dailyRequests?.[0];
      const resetAt = oldestRequest
        ? new Date(new Date(oldestRequest.created_at).getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: RATE_LIMITS.ANONYMOUS_PER_DAY,
        resetAt,
        message: 'Daily rate limit exceeded. Sign in to get higher limits!',
      };
    }

    // Log this request
    await supabase.from('rate_limits').insert({
      ip_address: ip,
      request_type: 'anonymous',
      created_at: now.toISOString(),
    });

    return {
      allowed: true,
      remaining: RATE_LIMITS.ANONYMOUS_PER_HOUR - hourlyCount - 1,
      limit: RATE_LIMITS.ANONYMOUS_PER_HOUR,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000),
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request on error (fail open)
    return {
      allowed: true,
      remaining: RATE_LIMITS.ANONYMOUS_PER_HOUR,
      limit: RATE_LIMITS.ANONYMOUS_PER_HOUR,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000),
    };
  }
}

/**
 * Check user-based rate limit for logged-in users
 */
export async function checkUserRateLimit(
  userId: string,
  requestType: 'battle' | 'chat' = 'battle'
): Promise<RateLimitResult> {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Get requests in the last hour
    const { data: hourlyRequests, error: hourError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', hourAgo.toISOString());

    if (hourError) throw hourError;

    const hourlyCount = hourlyRequests?.length || 0;

    // Check hourly limit
    if (hourlyCount >= RATE_LIMITS.USER_PER_HOUR) {
      const oldestRequest = hourlyRequests?.[0];
      const resetAt = oldestRequest
        ? new Date(new Date(oldestRequest.created_at).getTime() + 60 * 60 * 1000)
        : new Date(now.getTime() + 60 * 60 * 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: RATE_LIMITS.USER_PER_HOUR,
        resetAt,
        message: 'Hourly rate limit exceeded. Please wait a moment before trying again.',
      };
    }

    // Get requests in the last day for this type
    const { data: dailyRequests, error: dayError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('request_type', requestType)
      .gte('created_at', dayAgo.toISOString());

    if (dayError) throw dayError;

    const dailyCount = dailyRequests?.length || 0;
    const dailyLimit = requestType === 'battle' 
      ? RATE_LIMITS.USER_BATTLES_PER_DAY 
      : RATE_LIMITS.USER_CHATS_PER_DAY;

    // Check daily limit
    if (dailyCount >= dailyLimit) {
      const oldestRequest = dailyRequests?.[0];
      const resetAt = oldestRequest
        ? new Date(new Date(oldestRequest.created_at).getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: dailyLimit,
        resetAt,
        message: `Daily ${requestType} limit exceeded. You can use ${dailyLimit} ${requestType}s per day.`,
      };
    }

    // Check minimum request interval (anti-spam)
    if (hourlyRequests && hourlyRequests.length > 0) {
      const lastRequest = hourlyRequests[hourlyRequests.length - 1];
      const timeSinceLastRequest = now.getTime() - new Date(lastRequest.created_at).getTime();
      
      if (timeSinceLastRequest < RATE_LIMITS.MIN_REQUEST_INTERVAL_MS) {
        return {
          allowed: false,
          remaining: 0,
          limit: RATE_LIMITS.USER_PER_HOUR,
          resetAt: new Date(now.getTime() + RATE_LIMITS.MIN_REQUEST_INTERVAL_MS),
          message: 'Please wait a moment before sending another request.',
        };
      }
    }

    // Log this request
    await supabase.from('rate_limits').insert({
      user_id: userId,
      request_type: requestType,
      created_at: now.toISOString(),
    });

    return {
      allowed: true,
      remaining: dailyLimit - dailyCount - 1,
      limit: dailyLimit,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request on error (fail open)
    const dailyLimit = requestType === 'battle' 
      ? RATE_LIMITS.USER_BATTLES_PER_DAY 
      : RATE_LIMITS.USER_CHATS_PER_DAY;

    return {
      allowed: true,
      remaining: dailyLimit,
      limit: dailyLimit,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string): Promise<{
  battlesToday: number;
  chatsToday: number;
  requestsThisHour: number;
  battlesRemaining: number;
  chatsRemaining: number;
}> {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Get hourly requests
    const { data: hourlyData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', hourAgo.toISOString());

    // Get daily battles
    const { data: battleData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('request_type', 'battle')
      .gte('created_at', dayAgo.toISOString());

    // Get daily chats
    const { data: chatData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('request_type', 'chat')
      .gte('created_at', dayAgo.toISOString());

    const battlesToday = battleData?.length || 0;
    const chatsToday = chatData?.length || 0;
    const requestsThisHour = hourlyData?.length || 0;

    return {
      battlesToday,
      chatsToday,
      requestsThisHour,
      battlesRemaining: Math.max(0, RATE_LIMITS.USER_BATTLES_PER_DAY - battlesToday),
      chatsRemaining: Math.max(0, RATE_LIMITS.USER_CHATS_PER_DAY - chatsToday),
    };

  } catch (error) {
    console.error('Usage stats error:', error);
    return {
      battlesToday: 0,
      chatsToday: 0,
      requestsThisHour: 0,
      battlesRemaining: RATE_LIMITS.USER_BATTLES_PER_DAY,
      chatsRemaining: RATE_LIMITS.USER_CHATS_PER_DAY,
    };
  }
}

/**
 * Clean up old rate limit entries (run daily)
 */
export async function cleanupOldRateLimits(): Promise<void> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    await supabase
      .from('rate_limits')
      .delete()
      .lt('created_at', weekAgo.toISOString());

    console.log('Cleaned up old rate limit entries');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
