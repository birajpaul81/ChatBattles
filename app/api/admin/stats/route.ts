import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin user ID - REPLACE WITH YOUR CLERK USER ID
const ADMIN_USER_ID = 'user_34EhMJegPDOgylkYyupD2t7NIwB';

export async function GET() {
  try {
    // Check if user is admin
    const { userId } = await auth();
    
    if (!userId || userId !== ADMIN_USER_ID) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get requests in last hour
    const { data: hourlyRequests } = await supabase
      .from('api_logs')
      .select('*')
      .gte('created_at', hourAgo.toISOString());

    // Get requests today
    const { data: dailyRequests } = await supabase
      .from('api_logs')
      .select('*')
      .gte('created_at', dayAgo.toISOString());

    // Calculate stats
    const requestsThisHour = hourlyRequests?.length || 0;
    const requestsToday = dailyRequests?.length || 0;
    
    const rateLimitHits = dailyRequests?.filter(r => r.rate_limited).length || 0;
    const fallbackUsage = dailyRequests?.filter(r => r.used_fallback).length || 0;
    
    // Calculate cost (assuming $0 for free tier)
    const costToday = dailyRequests?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;

    // Model breakdown
    const modelMap = new Map();
    dailyRequests?.forEach(req => {
      const model = req.model_name || 'Unknown';
      if (!modelMap.has(model)) {
        modelMap.set(model, {
          modelName: model,
          requests: 0,
          fallbacks: 0,
          errors: 0,
          totalResponseTime: 0,
        });
      }
      
      const stats = modelMap.get(model);
      stats.requests++;
      if (req.used_fallback) stats.fallbacks++;
      if (req.error) stats.errors++;
      stats.totalResponseTime += req.response_time || 0;
    });

    const modelBreakdown = Array.from(modelMap.values()).map(stats => ({
      ...stats,
      avgResponseTime: stats.requests > 0 ? stats.totalResponseTime / stats.requests : 0,
    }));

    // Hourly breakdown (last 24 hours)
    const hourlyBreakdown = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourRequests = dailyRequests?.filter(r => {
        const reqTime = new Date(r.created_at);
        return reqTime >= hourStart && reqTime < hourEnd;
      }) || [];

      hourlyBreakdown.push({
        hour: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        requests: hourRequests.length,
        fallbacks: hourRequests.filter(r => r.used_fallback).length,
      });
    }

    // Recent requests (last 20)
    const recentRequests = (dailyRequests || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map(req => ({
        timestamp: new Date(req.created_at).toLocaleTimeString(),
        modelName: req.model_name || 'Unknown',
        usedFallback: req.used_fallback || false,
        responseTime: req.response_time || 0,
        error: req.error || false,
      }));

    return NextResponse.json({
      totalRequests: requestsToday,
      requestsThisHour,
      requestsToday,
      rateLimitHits,
      fallbackUsage,
      costToday,
      modelBreakdown,
      hourlyBreakdown,
      recentRequests,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
