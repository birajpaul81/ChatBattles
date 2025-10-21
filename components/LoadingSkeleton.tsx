"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type?: "card" | "text" | "profile";
  count?: number;
}

export default function LoadingSkeleton({ type = "card", count = 1 }: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border-2 border-accent/30 min-h-[300px]"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-accent/20 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-accent/10 rounded"></div>
                <div className="h-4 bg-accent/10 rounded w-5/6"></div>
                <div className="h-4 bg-accent/10 rounded w-4/6"></div>
                <div className="h-4 bg-accent/10 rounded w-3/6"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </>
    );
  }

  if (type === "text") {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-accent/10 rounded w-full"></div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-accent/20 rounded w-3/4"></div>
                <div className="h-4 bg-accent/10 rounded w-1/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-black/50 rounded-lg p-4 border border-accent/20">
                  <div className="h-4 bg-accent/20 rounded w-1/2 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-accent/10 rounded"></div>
                    <div className="h-3 bg-accent/10 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
