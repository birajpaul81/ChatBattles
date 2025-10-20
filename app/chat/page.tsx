"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatInput from "@/components/ChatInput";
import BattleCard from "@/components/BattleCard";
import AnimatedBackground from "@/components/AnimatedBackground";

type BattleResult = {
  model: string;
  name: string;
  text: string;
};

export default function ChatPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);

  const handleSubmit = async (userPrompt: string) => {
    setIsLoading(true);
    setPrompt(userPrompt);
    setBattleResults([]);

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
        console.error("Battle failed:", data.error);
      }
    } catch (error) {
      console.error("Error during battle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setConversationHistory([]);
    setBattleResults([]);
    setPrompt("");
  };

  const modelColors: Record<string, "orange" | "red" | "amber"> = {
    "provider-3/gpt-5-nano": "orange",
    "provider-5/grok-4-0709": "red",
    "provider-1/deepseek-v3.1": "amber",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-white">
                Welcome, <span className="text-accent">{user?.firstName}</span>
              </h1>
              {conversationHistory.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-semibold transition-all duration-200"
                  title="Clear conversation history"
                >
                  Clear Chat
                </button>
              )}
            </div>
            <p className="text-softGray text-lg">
              {conversationHistory.length > 0 
                ? `Chatting continuously (${Math.floor(conversationHistory.length / 2)} messages)`
                : "Enter your prompt below to battle the top AI models"}
            </p>
          </motion.div>

          {/* Chat Input */}
          <div className="mb-12">
            <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

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

              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-accent">⚔️</span>
                {isLoading ? "Battle in Progress..." : "Battle Results"}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <>
                    <BattleCard
                      model="provider-3/gpt-5-nano"
                      name="GPT-5-Nano"
                      text=""
                      color="orange"
                      isLoading={true}
                      index={0}
                    />
                    <BattleCard
                      model="provider-5/grok-4-0709"
                      name="Grok-4"
                      text=""
                      color="red"
                      isLoading={true}
                      index={1}
                    />
                    <BattleCard
                      model="provider-1/deepseek-v3.1"
                      name="DeepSeek v3.1"
                      text=""
                      color="amber"
                      isLoading={true}
                      index={2}
                    />
                  </>
                ) : (
                  battleResults.map((result, index) => (
                    <BattleCard
                      key={result.model}
                      model={result.model}
                      name={result.name}
                      text={result.text}
                      color={modelColors[result.model]}
                      index={index}
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

