"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react";

interface ModelStats {
  up: number;
  down: number;
  total: number;
  score: number;
  percentage: number;
}

interface VoteStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoteStats({ isOpen, onClose }: VoteStatsProps) {
  const [stats, setStats] = useState<Record<string, ModelStats>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/votes");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setTotalVotes(data.totalVotes);
      } else {
        setError(data.error || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching vote stats:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getModelDisplayName = (model: string): string => {
    const names: Record<string, string> = {
      "provider-3/gpt-5-nano": "GPT-5-Nano",
      "provider-3/llama-4-scout": "Llama-4 Scout",
      "provider-1/deepseek-v3.1": "DeepSeek v3.1",
      "provider-3/gemini-2.5-flash-lite-preview-09-2025": "Gemini 2.5 Flash",
    };
    return names[model] || model;
  };

  const getModelColor = (model: string): string => {
    const colors: Record<string, string> = {
      "provider-3/gpt-5-nano": "text-orange-500",
      "provider-3/llama-4-scout": "text-red-500",
      "provider-1/deepseek-v3.1": "text-amber-500",
      "provider-3/gemini-2.5-flash-lite-preview-09-2025": "text-blue-500",
    };
    return colors[model] || "text-white";
  };

  const getModelBorderColor = (model: string): string => {
    const colors: Record<string, string> = {
      "provider-3/gpt-5-nano": "border-orange-500",
      "provider-3/llama-4-scout": "border-red-500",
      "provider-1/deepseek-v3.1": "border-amber-500",
      "provider-3/gemini-2.5-flash-lite-preview-09-2025": "border-blue-500",
    };
    return colors[model] || "border-white";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-darkBg border-2 border-accent rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-accent" size={28} />
            <h2 className="text-2xl font-orbitron font-bold text-white">
              Vote Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-softGray hover:text-accent transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Total Votes */}
        <div className="bg-black/30 border border-accent/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-softGray">Total Votes Recorded</span>
            <span className="text-2xl font-bold text-accent">{totalVotes}</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex space-x-2">
              <motion.div
                className="w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-500 text-center">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-500 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Display */}
        {!isLoading && !error && Object.keys(stats).length === 0 && (
          <div className="text-center py-12">
            <p className="text-softGray text-lg">No votes recorded yet.</p>
            <p className="text-softGray/60 text-sm mt-2">
              Start voting on AI responses to see statistics!
            </p>
          </div>
        )}

        {!isLoading && !error && Object.keys(stats).length > 0 && (
          <div className="space-y-4">
            {Object.entries(stats).map(([model, modelStats], index) => (
              <motion.div
                key={model}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black/30 border-2 ${getModelBorderColor(model)} rounded-lg p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {index === 0 && (
                      <Trophy className="text-yellow-500" size={24} />
                    )}
                    <h3 className={`text-xl font-bold ${getModelColor(model)}`}>
                      {getModelDisplayName(model)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">
                      {modelStats.score > 0 ? "+" : ""}{modelStats.score}
                    </span>
                    <TrendingUp
                      className={modelStats.score >= 0 ? "text-green-500" : "text-red-500"}
                      size={20}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-softGray">Approval Rate</span>
                    <span className="text-sm font-semibold text-white">
                      {modelStats.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${modelStats.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        modelStats.percentage >= 75
                          ? "bg-green-500"
                          : modelStats.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Vote Counts */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsUp size={16} className="text-green-500" />
                      <span className="text-xs text-softGray">Upvotes</span>
                    </div>
                    <span className="text-xl font-bold text-green-500">
                      {modelStats.up}
                    </span>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsDown size={16} className="text-red-500" />
                      <span className="text-xs text-softGray">Downvotes</span>
                    </div>
                    <span className="text-xl font-bold text-red-500">
                      {modelStats.down}
                    </span>
                  </div>
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={16} className="text-accent" />
                      <span className="text-xs text-softGray">Total</span>
                    </div>
                    <span className="text-xl font-bold text-accent">
                      {modelStats.total}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-accent/20">
          <p className="text-xs text-softGray text-center">
            Statistics are updated in real-time based on all user votes
          </p>
        </div>
      </motion.div>
    </div>
  );
}
