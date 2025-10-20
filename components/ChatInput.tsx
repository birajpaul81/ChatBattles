"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

export default function ChatInput({ onSubmit, isLoading, showClearButton, onClear }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`relative bg-black/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-accent glow-orange-strong"
            : "border-accent/30"
        }`}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your prompt to battle the AIs..."
          className={`w-full bg-transparent text-white placeholder-softGray/50 px-6 py-4 resize-none focus:outline-none min-h-[60px] max-h-[200px] ${
            showClearButton ? 'pr-56' : 'pr-24'
          }`}
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-semibold transition-all duration-200"
              title="Clear conversation history"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              prompt.trim() && !isLoading
                ? "gradient-orange text-white glow-orange hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "..." : "Battle"}
          </button>
        </div>
      </div>
      <p className="text-xs text-softGray/60 text-center mt-2">
        Press Enter to send • Shift+Enter for new line
      </p>
    </motion.form>
  );
}

