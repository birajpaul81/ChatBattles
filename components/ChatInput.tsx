"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a creative short story about AI",
  "Help me debug this Python code",
  "What are the best practices for React?",
  "Explain the theory of relativity",
  "Write a haiku about technology",
];

const MAX_CHARACTERS = 4000;

export default function ChatInput({ onSubmit, isLoading, showClearButton, onClear }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && prompt.length <= MAX_CHARACTERS) {
      onSubmit(prompt.trim());
      setPrompt("");
      setShowSuggestions(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const isOverLimit = prompt.length > MAX_CHARACTERS;
  const charCountColor = isOverLimit
    ? "text-red-500"
    : prompt.length > MAX_CHARACTERS * 0.9
    ? "text-amber-500"
    : "text-softGray/60";

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Suggested Prompts */}
      {!prompt && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-softGray hover:text-accent transition-colors flex items-center gap-2 mb-2"
          >
            <Sparkles size={16} />
            {showSuggestions ? "Hide" : "Show"} suggested prompts
          </button>
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {SUGGESTED_PROMPTS.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg text-sm text-softGray hover:text-white hover:border-accent transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <form onSubmit={handleSubmit}>
      <div
        className={`relative bg-black/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-accent glow-orange-strong"
            : "border-accent/30"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your prompt to battle the AIs..."
          className={`w-full bg-transparent text-white placeholder-softGray/50 px-6 py-4 resize-none focus:outline-none min-h-[60px] max-h-[200px] ${
            showClearButton ? 'pr-56' : 'pr-32'
          }`}
          rows={1}
          disabled={isLoading}
          maxLength={MAX_CHARACTERS}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          aria-label="Chat input"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent transition-all duration-200"
            title="Voice input (coming soon)"
            disabled
          >
            <Mic size={18} />
          </button>
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
            disabled={!prompt.trim() || isLoading || isOverLimit}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              prompt.trim() && !isLoading && !isOverLimit
                ? "gradient-orange text-white glow-orange hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            aria-label="Submit prompt"
          >
            {isLoading ? "..." : "Battle"}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-softGray/60">
          Press Enter to send • Shift+Enter for new line
        </p>
        <p className={`text-xs font-mono ${charCountColor}`}>
          {prompt.length} / {MAX_CHARACTERS}
        </p>
      </div>
      </form>
    </motion.div>
  );
}

