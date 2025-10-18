"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BattleCardProps {
  model: string;
  name: string;
  text: string;
  color: "orange" | "red" | "amber";
  isLoading?: boolean;
  index: number;
}

export default function BattleCard({
  model,
  name,
  text,
  color,
  isLoading = false,
  index,
}: BattleCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const colorClasses = {
    orange: "border-accent glow-orange",
    red: "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]",
    amber: "border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.5)]",
  };

  useEffect(() => {
    if (!isLoading && text) {
      let currentIndex = 0;
      setDisplayedText("");
      setIsTyping(true);

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [text, isLoading]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-black/50 backdrop-blur-sm rounded-xl p-6 border-2 ${colorClasses[color]} min-h-[300px] flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-orbitron font-bold text-white">{name}</h3>
        <span className="text-xs text-softGray font-mono">{model}</span>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
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
        ) : (
          <p className="text-softGray leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {isTyping && (
              <motion.span
                className="inline-block w-2 h-5 bg-accent ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </p>
        )}
      </div>

      {!isLoading && text && (
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm text-accent transition-all duration-200"
          >
            Copy
          </button>
        </div>
      )}
    </motion.div>
  );
}

