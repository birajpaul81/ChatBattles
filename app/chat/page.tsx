"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatInput, { AttachedFile } from "@/components/ChatInput";
import BattleCard from "@/components/BattleCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import Toast from "@/components/Toast";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ShareModal from "@/components/ShareModal";
import VoteStats from "@/components/VoteStats";
import { useToast } from "@/lib/useToast";
import { Share2, BarChart3 } from "lucide-react";

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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVoteStats, setShowVoteStats] = useState(false);

  const handleSubmit = async (userPrompt: string, attachments?: AttachedFile[]) => {
    setIsLoading(true);
    setPrompt(userPrompt);
    setBattleResults([]);
    setError(null);

    try {
      // Process attachments
      const processedAttachments: Array<{type: string; data: string; filename: string}> = [];
      
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.type === 'image' && attachment.preview) {
            // For images, send base64 data
            processedAttachments.push({
              type: 'image',
              data: attachment.preview,
              filename: attachment.file.name
            });
          } else {
            // For documents, read as text
            const text = await attachment.file.text();
            processedAttachments.push({
              type: 'document',
              data: text,
              filename: attachment.file.name
            });
          }
        }
      }

      // Debug: Log conversation history being sent
      console.log('=== SENDING TO API ===');
      console.log('Conversation history length:', conversationHistory.length);
      console.log('Conversation history:', conversationHistory);
      console.log('Current prompt:', userPrompt);
      console.log('=====================');

      // Fetch battle results with conversation history and attachments
      const response = await fetch("/api/a4f-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userPrompt,
          conversationHistory,
          attachments: processedAttachments.length > 0 ? processedAttachments : undefined
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
        
        if (saveData.success && saveData.data?.id) {
          // Store chat ID for vote persistence
          setCurrentChatId(saveData.data.id);
          console.log("Chat ID stored:", saveData.data.id);
        } else {
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

  const handleVote = useCallback(async (model: string, vote: "up" | "down") => {
    // Update local state immediately for UI responsiveness
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

    // Persist vote to database
    if (currentChatId) {
      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: currentChatId,
            model,
            voteType: vote,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          console.log("Vote saved to database:", data);
          showToast(vote === "up" ? "Vote recorded!" : "Feedback recorded!", "success");
        } else {
          console.error("Failed to save vote:", data.error);
          showToast("Failed to save vote. Please try again.", "error");
        }
      } catch (error) {
        console.error("Error saving vote:", error);
        showToast("Failed to save vote. Please try again.", "error");
      }
    } else {
      console.warn("No chat ID available for vote persistence");
      showToast(vote === "up" ? "Vote recorded (local only)" : "Feedback recorded (local only)", "info");
    }
  }, [currentChatId, showToast]);

  const handleClearConversation = useCallback(() => {
    setConversationHistory([]);
    setBattleResults([]);
    setPrompt("");
    setError(null);
    showToast("Conversation cleared", "info");
  }, [showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('input') !== null ||
        target.closest('textarea') !== null;
      
      // Escape to clear conversation (only when not typing)
      if (e.key === "Escape" && conversationHistory.length > 0 && !showKeyboardShortcuts && !isTyping) {
        handleClearConversation();
      }
      // ? to toggle shortcuts modal (only when not typing)
      if (e.key === "?" && !showKeyboardShortcuts && !isTyping) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [conversationHistory, showKeyboardShortcuts, handleClearConversation]);

  const modelColors: Record<string, "orange" | "red" | "amber" | "blue"> = {
    "openai/gpt-oss-120b": "orange",
    "provider-3/llama-4-scout": "red",
    "deepseek/deepseek-chat-v3.1:free": "amber",
    "gemini-2.5-flash-lite": "blue",
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
      <VoteStats
        isOpen={showVoteStats}
        onClose={() => setShowVoteStats(false)}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowVoteStats(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-500 transition-all"
                      title="View vote statistics"
                    >
                      <BarChart3 size={18} />
                      <span className="hidden sm:inline">Stats</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-all"
                    >
                      <Share2 size={18} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {isLoading ? (
                  // Show individual thinking states for each model
                  Object.entries(modelColors).map(([modelId, color], index) => {
                    const modelNames: Record<string, string> = {
                      'openai/gpt-oss-120b': 'GPT-5',
                      'provider-3/llama-4-scout': 'Llama-4',
                      'deepseek/deepseek-chat-v3.1:free': 'DeepSeek v3.1',
                      'gemini-2.5-flash-lite': 'Google Gemini 2.5 Pro'
                    };
                    return (
                      <BattleCard
                        key={modelId}
                        model={modelId}
                        name={modelNames[modelId] || 'AI Model'}
                        text=""
                        color={color}
                        isLoading={true}
                        index={index}
                      />
                    );
                  })
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

