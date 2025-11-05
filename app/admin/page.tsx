'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Zap,
  Clock,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Admin user ID - REPLACE WITH YOUR CLERK USER ID
const ADMIN_USER_ID = 'user_34EhMJegPDOgylkYyupD2t7NIwB';

interface RateLimitStats {
  totalRequests: number;
  requestsThisHour: number;
  requestsToday: number;
  rateLimitHits: number;
  fallbackUsage: number;
  costToday: number;
  modelBreakdown: {
    modelName: string;
    requests: number;
    fallbacks: number;
    errors: number;
    avgResponseTime: number;
  }[];
  hourlyBreakdown: {
    hour: string;
    requests: number;
    fallbacks: number;
  }[];
  recentRequests: {
    timestamp: string;
    modelName: string;
    usedFallback: boolean;
    responseTime: number;
    error: boolean;
  }[];
}

// Free tier limits for each provider
const RATE_LIMITS = {
  openrouter: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
    tokensPerDay: 100000,
  },
  a4f: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    tokensPerDay: 500000,
  },
  deepseek: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
  },
  llama: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
  },
  claude: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
  },
  mistral: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
  },
};

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.id !== ADMIN_USER_ID)) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || user.id !== ADMIN_USER_ID) {
    return null;
  }

  const calculatePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Real-time API usage and rate limit monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                autoRefresh 
                  ? 'bg-green-500/20 border-green-500/40 text-green-500' 
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Refresh Now
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Requests Today */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="text-blue-500" size={24} />
                  <span className="text-2xl font-bold">{stats.requestsToday}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Requests Today</h3>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.requestsThisHour} in last hour
                </div>
              </div>

              {/* Rate Limit Hits */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  <span className="text-2xl font-bold">{stats.rateLimitHits}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Rate Limit Hits</h3>
                <div className="mt-2 text-xs text-gray-500">
                  {((stats.rateLimitHits / stats.requestsToday) * 100).toFixed(1)}% of requests
                </div>
              </div>

              {/* Fallback Usage */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="text-orange-500" size={24} />
                  <span className="text-2xl font-bold">{stats.fallbackUsage}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Fallback Requests</h3>
                <div className="mt-2 text-xs text-gray-500">
                  {((stats.fallbackUsage / stats.requestsToday) * 100).toFixed(1)}% fallback rate
                </div>
              </div>

              {/* Cost Today */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="text-green-500" size={24} />
                  <span className="text-2xl font-bold">${stats.costToday.toFixed(2)}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Cost Today</h3>
                <div className="mt-2 text-xs text-gray-500">
                  ${(stats.costToday / stats.requestsToday).toFixed(4)} per request
                </div>
              </div>
            </div>

            {/* Rate Limit Status */}
            <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-orange-500" />
                Rate Limit Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* OpenRouter Free Tier */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">OpenRouter (Free Tier)</h3>
                  
                  <div className="space-y-4">
                    {/* Per Minute */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Per Minute</span>
                        <span className="font-semibold">
                          {stats.requestsThisHour} / {RATE_LIMITS.openrouter.requestsPerMinute}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            calculatePercentage(stats.requestsThisHour, RATE_LIMITS.openrouter.requestsPerMinute) >= 90 
                              ? 'bg-red-500' 
                              : calculatePercentage(stats.requestsThisHour, RATE_LIMITS.openrouter.requestsPerMinute) >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${calculatePercentage(stats.requestsThisHour, RATE_LIMITS.openrouter.requestsPerMinute)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Per Day */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Per Day</span>
                        <span className="font-semibold">
                          {stats.requestsToday} / {RATE_LIMITS.openrouter.requestsPerDay}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            calculatePercentage(stats.requestsToday, RATE_LIMITS.openrouter.requestsPerDay) >= 90 
                              ? 'bg-red-500' 
                              : calculatePercentage(stats.requestsToday, RATE_LIMITS.openrouter.requestsPerDay) >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${calculatePercentage(stats.requestsToday, RATE_LIMITS.openrouter.requestsPerDay)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* A4F API */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">A4F API</h3>
                  
                  <div className="space-y-4">
                    {/* Per Minute */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Per Minute</span>
                        <span className="font-semibold">
                          {stats.requestsThisHour} / {RATE_LIMITS.a4f.requestsPerMinute}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{ 
                            width: `${calculatePercentage(stats.requestsThisHour, RATE_LIMITS.a4f.requestsPerMinute)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Per Day */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Per Day</span>
                        <span className="font-semibold">
                          {stats.requestsToday} / {RATE_LIMITS.a4f.requestsPerDay}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{ 
                            width: `${calculatePercentage(stats.requestsToday, RATE_LIMITS.a4f.requestsPerDay)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Rate Limits */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">User Rate Limits</h3>
                  
                  <div className="space-y-4">
                    {/* Battles Per Day */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Battles/Day</span>
                        <span className="font-semibold">
                          {stats.requestsToday} / 100
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${calculatePercentage(stats.requestsToday, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Per Hour */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Per Hour</span>
                        <span className="font-semibold">
                          {stats.requestsThisHour} / 100
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${calculatePercentage(stats.requestsThisHour, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Breakdown */}
            <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-orange-500" />
                Model Performance
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">Model</th>
                      <th className="text-right py-3 px-4">Requests</th>
                      <th className="text-right py-3 px-4">Fallbacks</th>
                      <th className="text-right py-3 px-4">Errors</th>
                      <th className="text-right py-3 px-4">Avg Response</th>
                      <th className="text-right py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.modelBreakdown.map((model, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                        <td className="py-3 px-4 font-semibold">{model.modelName}</td>
                        <td className="py-3 px-4 text-right">{model.requests}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={model.fallbacks > 0 ? 'text-orange-500' : 'text-gray-500'}>
                            {model.fallbacks}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={model.errors > 0 ? 'text-red-500' : 'text-gray-500'}>
                            {model.errors}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{model.avgResponseTime.toFixed(2)}s</td>
                        <td className="py-3 px-4 text-right">
                          {model.errors === 0 ? (
                            <CheckCircle size={20} className="text-green-500 inline" />
                          ) : (
                            <XCircle size={20} className="text-red-500 inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly Breakdown */}
            <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-orange-500" />
                Hourly Breakdown (Last 24 Hours)
              </h2>

              <div className="flex items-end justify-between gap-2 h-64">
                {stats.hourlyBreakdown.map((hour, idx) => {
                  const maxRequests = Math.max(...stats.hourlyBreakdown.map(h => h.requests));
                  const height = (hour.requests / maxRequests) * 100;
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        {/* Fallback bar */}
                        {hour.fallbacks > 0 && (
                          <div 
                            className="w-full bg-orange-500/30 rounded-t"
                            style={{ height: `${(hour.fallbacks / maxRequests) * 100}%` }}
                          />
                        )}
                        {/* Primary bar */}
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left">
                        {hour.hour}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span>Primary Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500/30 rounded" />
                  <span>Fallback Requests</span>
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Requests (Last 20)</h2>

              <div className="space-y-2">
                {stats.recentRequests.map((req, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      req.error 
                        ? 'bg-red-500/10 border-red-500/20' 
                        : req.usedFallback
                        ? 'bg-orange-500/10 border-orange-500/20'
                        : 'bg-gray-900/50 border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{req.timestamp}</span>
                      <span className="font-semibold">{req.modelName}</span>
                      {req.usedFallback && (
                        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">
                          Fallback
                        </span>
                      )}
                      {req.error && (
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                          Error
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{req.responseTime.toFixed(2)}s</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
