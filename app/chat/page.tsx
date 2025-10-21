"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatInput from "@/components/ChatInput";
import BattleCard from "@/components/BattleCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Toast from "@/components/Toast";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/lib/useToast";
import { Share2 } from "lucide-react";

type BattleResult = {
  model: string;
  name: string;
  text: string;
  votes?: { up: number; down: number };
};

export default function ChatPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSubmit = async (userPrompt: string) => {
    setIsLoading(true);
    setPrompt(userPrompt);
    setBattleResults([]);
    setError(null);

    try {
      // Fetch battle results with conversation history
      const response = await fetch("/api/a4f-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userPrompt,
          conversationHistory 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBattleResults(data.results);

        // Update conversation history with user prompt and AI responses
        const newHistory = [
          ...conversationHistory,
          { role: "user", content: userPrompt },
          { role: "assistant", content: data.results[0].text } // Using first model's response
        ];
        setConversationHistory(newHistory);

        // Save to database
        const saveResponse = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userPrompt,
            responses: data.results,
          }),
        });
        
        const saveData = await saveResponse.json();
        console.log("Chat save response:", saveData);
        
        if (!saveData.success) {
          console.error("Failed to save chat:", saveData.error);
        }
      } else {
        const errorMsg = data.error || "Failed to get AI responses";
        setError(errorMsg);
        showToast(errorMsg, "error");
        console.error("Battle failed:", data.error);
      }
    } catch (error) {
      const errorMsg = "Network error. Please check your connection and try again.";
      setError(errorMsg);
      showToast(errorMsg, "error");
      console.error("Error during battle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = useCallback((model: string, vote: "up" | "down") => {
    setVotes((prev) => {
      const current = prev[model] || { up: 0, down: 0 };
      return {
        ...prev,
        [model]: {
          up: vote === "up" ? current.up + 1 : current.up,
          down: vote === "down" ? current.down + 1 : current.down,
        },
      };
    });
    showToast(vote === "up" ? "Vote recorded!" : "Feedback recorded!", "success");
  }, [showToast]);

  const handleClearConversation = () => {
    setConversationHistory([]);
    setBattleResults([]);
    setPrompt("");
    setError(null);
    showToast("Conversation cleared", "info");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Escape to clear conversation
      if (e.key === "Escape" && conversationHistory.length > 0 && !showKeyboardShortcuts) {
        handleClearConversation();
      }
      // ? to toggle shortcuts modal
      if (e.key === "?" && !showKeyboardShortcuts) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [conversationHistory, showKeyboardShortcuts]);

  const modelColors: Record<string, "orange" | "red" | "amber"> = {
    "provider-3/gpt-5-nano": "orange",
    "provider-5/grok-4-0709": "red",
    "provider-1/deepseek-v3.1": "amber",
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-accent text-white rounded-lg"
      >
        Skip to main content
      </a>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        battleData={battleResults.length > 0 ? { prompt, results: battleResults } : undefined}
      />
      <AnimatedBackground />
      <Navbar />

      <main id="main-content" className="flex-1 px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-white mb-4">
              Welcome, <span className="text-accent">{user?.firstName}</span>
            </h1>
            <p className="text-softGray text-lg">
              {conversationHistory.length > 0 
                ? `Chatting continuously (${Math.floor(conversationHistory.length / 2)} messages)`
                : "Enter your prompt below to battle the top AI models"}
            </p>
            {conversationHistory.length > 0 && (
              <p className="text-xs text-softGray/60 mt-2">
                Press <kbd className="px-2 py-1 bg-accent/20 rounded text-accent">Esc</kbd> to clear conversation
              </p>
            )}
          </motion.div>

          {/* Chat Input */}
          <div className="mb-12">
            <ChatInput 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
              showClearButton={conversationHistory.length > 0}
              onClear={handleClearConversation}
            />
          </div>

          {/* Error Display */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 text-center"
            >
              <p className="text-red-500 font-semibold mb-2">❌ Error</p>
              <p className="text-white">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-500 transition-all"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Battle Results */}
          {(isLoading || battleResults.length > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              {prompt && (
                <div className="bg-black/30 backdrop-blur-sm border border-accent/20 rounded-xl p-6 mb-8">
                  <h3 className="text-sm font-semibold text-softGray mb-2">
                    Your Prompt:
                  </h3>
                  <p className="text-white text-lg">{prompt}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-3">
                  <span className="text-accent">⚔️</span>
                  {isLoading ? "Battle in Progress..." : "Battle Results"}
                </h2>
                {!isLoading && battleResults.length > 0 && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-all"
                  >
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {isLoading ? (
                  <LoadingSkeleton type="card" count={3} />
                ) : (
                  battleResults.map((result, index) => (
                    <BattleCard
                      key={result.model}
                      model={result.model}
                      name={result.name}
                      text={result.text}
                      color={modelColors[result.model]}
                      index={index}
                      onVote={handleVote}
                      votes={votes[result.model]}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && battleResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
                Ready to Battle
              </h3>
              <p className="text-softGray">
                Type your prompt above and watch the AIs compete
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

