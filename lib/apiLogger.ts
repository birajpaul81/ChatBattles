/**
 * API Logger for Admin Dashboard
 * 
 * Logs all API requests to Supabase for monitoring and analytics
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ApiLogEntry {
  userId?: string;
  ipAddress?: string;
  modelName: string;
  provider: 'a4f' | 'openrouter' | 'groq' | 'google';
  usedFallback?: boolean;
  rateLimited?: boolean;
  error?: boolean;
  errorMessage?: string;
  responseTime?: number;
  tokensUsed?: number;
  cost?: number;
}

/**
 * Log an API request to the database
 */
export async function logApiRequest(entry: ApiLogEntry): Promise<void> {
  try {
    await supabase.from('api_logs').insert({
      user_id: entry.userId || null,
      ip_address: entry.ipAddress || null,
      model_name: entry.modelName,
      provider: entry.provider,
      used_fallback: entry.usedFallback || false,
      rate_limited: entry.rateLimited || false,
      error: entry.error || false,
      error_message: entry.errorMessage || null,
      response_time: entry.responseTime || null,
      tokens_used: entry.tokensUsed || null,
      cost: entry.cost || 0,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't throw - logging should never break the main flow
    console.error('Failed to log API request:', error);
  }
}

/**
 * Get current rate limit usage for OpenRouter
 */
export async function getOpenRouterUsage(): Promise<{
  requestsThisMinute: number;
  requestsToday: number;
  tokensToday: number;
}> {
  try {
    const now = new Date();
    const minuteAgo = new Date(now.getTime() - 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Requests in last minute
    const { data: minuteData } = await supabase
      .from('api_logs')
      .select('*')
      .eq('provider', 'openrouter')
      .gte('created_at', minuteAgo.toISOString());

    // Requests today
    const { data: dayData } = await supabase
      .from('api_logs')
      .select('*')
      .eq('provider', 'openrouter')
      .gte('created_at', dayAgo.toISOString());

    const requestsThisMinute = minuteData?.length || 0;
    const requestsToday = dayData?.length || 0;
    const tokensToday = dayData?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

    return {
      requestsThisMinute,
      requestsToday,
      tokensToday,
    };
  } catch (error) {
    console.error('Failed to get OpenRouter usage:', error);
    return {
      requestsThisMinute: 0,
      requestsToday: 0,
      tokensToday: 0,
    };
  }
}

/**
 * Get current rate limit usage for A4F
 */
export async function getA4FUsage(): Promise<{
  requestsThisMinute: number;
  requestsToday: number;
}> {
  try {
    const now = new Date();
    const minuteAgo = new Date(now.getTime() - 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Requests in last minute
    const { data: minuteData } = await supabase
      .from('api_logs')
      .select('*')
      .eq('provider', 'a4f')
      .gte('created_at', minuteAgo.toISOString());

    // Requests today
    const { data: dayData } = await supabase
      .from('api_logs')
      .select('*')
      .eq('provider', 'a4f')
      .gte('created_at', dayAgo.toISOString());

    return {
      requestsThisMinute: minuteData?.length || 0,
      requestsToday: dayData?.length || 0,
    };
  } catch (error) {
    console.error('Failed to get A4F usage:', error);
    return {
      requestsThisMinute: 0,
      requestsToday: 0,
    };
  }
}

/**
 * Check if we're approaching rate limits
 */
export async function checkRateLimitWarnings(): Promise<{
  openRouterWarning: boolean;
  a4fWarning: boolean;
  message?: string;
}> {
  const openRouterUsage = await getOpenRouterUsage();
  const a4fUsage = await getA4FUsage();

  // OpenRouter free tier limits
  const OPENROUTER_LIMITS = {
    requestsPerMinute: 20,
    requestsPerDay: 200,
    tokensPerDay: 100000,
  };

  // A4F limits (adjust based on your plan)
  const A4F_LIMITS = {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
  };

  const openRouterWarning = 
    openRouterUsage.requestsThisMinute >= OPENROUTER_LIMITS.requestsPerMinute * 0.8 ||
    openRouterUsage.requestsToday >= OPENROUTER_LIMITS.requestsPerDay * 0.8 ||
    openRouterUsage.tokensToday >= OPENROUTER_LIMITS.tokensPerDay * 0.8;

  const a4fWarning =
    a4fUsage.requestsThisMinute >= A4F_LIMITS.requestsPerMinute * 0.8 ||
    a4fUsage.requestsToday >= A4F_LIMITS.requestsPerDay * 0.8;

  let message = '';
  if (openRouterWarning) {
    message += 'OpenRouter approaching rate limits. ';
  }
  if (a4fWarning) {
    message += 'A4F approaching rate limits. ';
  }

  return {
    openRouterWarning,
    a4fWarning,
    message: message || undefined,
  };
}

/**
 * Get fallback usage percentage
 */
export async function getFallbackRate(): Promise<number> {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('api_logs')
      .select('*')
      .gte('created_at', dayAgo.toISOString());

    if (!data || data.length === 0) return 0;

    const fallbackCount = data.filter(log => log.used_fallback).length;
    return (fallbackCount / data.length) * 100;
  } catch (error) {
    console.error('Failed to get fallback rate:', error);
    return 0;
  }
}
