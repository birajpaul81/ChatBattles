"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Copy, Check, Maximize2, Minimize2 } from "lucide-react";

interface BattleCardProps {
  model: string;
  name: string;
  text: string;
  color: "orange" | "red" | "amber" | "blue";
  isLoading?: boolean;
  index: number;
  onVote?: (model: string, vote: "up" | "down") => void;
  votes?: { up: number; down: number };
}

export default function BattleCard({
  model,
  name,
  text,
  color,
  isLoading = false,
  index,
  onVote,
  votes = { up: 0, down: 0 },
}: BattleCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const colorClasses = {
    orange: "border-accent hover:glow-orange-strong transition-shadow duration-300",
    red: "border-red-500 hover:glow-red-strong transition-shadow duration-300",
    amber: "border-amber-500 hover:glow-amber-strong transition-shadow duration-300",
    blue: "border-blue-500 hover:glow-blue-strong transition-shadow duration-300",
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleVote = (vote: "up" | "down") => {
    if (userVote === vote) {
      setUserVote(null);
    } else {
      setUserVote(vote);
      onVote?.(model, vote);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-black/50 backdrop-blur-sm rounded-xl p-6 border-2 ${colorClasses[color]} ${isExpanded ? 'min-h-[500px]' : 'min-h-[300px]'} flex flex-col transition-all duration-300 hover:scale-[1.02]`}
      role="article"
      aria-label={`${name} response`}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-orbitron font-bold text-white">{name}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-softGray hover:text-accent transition-colors p-2"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto mb-4 ${isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            {/* Thinking animation with model-specific color */}
            <div className="flex space-x-2">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  color === 'orange' ? 'bg-accent' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'amber' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  color === 'orange' ? 'bg-accent' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'amber' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  color === 'orange' ? 'bg-accent' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'amber' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            {/* Thinking text */}
            <motion.p
              className="text-softGray text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {name} is thinking...
            </motion.p>
            {/* Pulsing glow effect */}
            <motion.div
              className={`w-16 h-16 rounded-full blur-xl ${
                color === 'orange' ? 'bg-accent/30' :
                color === 'red' ? 'bg-red-500/30' :
                color === 'amber' ? 'bg-amber-500/30' :
                'bg-blue-500/30'
              }`}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm text-accent transition-all duration-200 flex items-center gap-2"
              aria-label="Copy to clipboard"
            >
              {isCopied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          {onVote && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleVote("up")}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  userVote === "up"
                    ? "bg-green-500/20 border-green-500 text-green-500"
                    : "bg-accent/10 border-accent/30 text-softGray hover:text-green-500 hover:border-green-500/50"
                }`}
                aria-label="Vote up"
                title={`Upvotes: ${votes.up}`}
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => handleVote("down")}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  userVote === "down"
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "bg-accent/10 border-accent/30 text-softGray hover:text-red-500 hover:border-red-500/50"
                }`}
                aria-label="Vote down"
                title={`Downvotes: ${votes.down}`}
              >
                <ThumbsDown size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

