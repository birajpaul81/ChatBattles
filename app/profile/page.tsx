"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

type Chat = {
  id: string;
  prompt: string;
  responses: { model: string; name: string; text: string }[];
  created_at: string;
};

export default function ProfilePage() {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      const data = await response.json();

      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/chats", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setChats([]);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-white mb-4">
              Profile
            </h1>
            <div className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                  className="w-16 h-16 rounded-full border-2 border-accent"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user?.fullName}
                  </h2>
                  <p className="text-softGray">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-orbitron font-bold text-white">
                Recent Chats
              </h2>
              {chats.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm text-red-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isDeleting ? "Clearing..." : "Clear History"}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-20 bg-black/30 backdrop-blur-sm border border-accent/20 rounded-xl">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                  No chat history yet
                </h3>
                <p className="text-softGray">
                  Start a battle to see your chat history here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl p-6 hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex-1">
                        {chat.prompt}
                      </h3>
                      <span className="text-xs text-softGray ml-4">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {chat.responses.map((response) => (
                        <div
                          key={response.model}
                          className="bg-black/50 rounded-lg p-4 border border-accent/20"
                        >
                          <h4 className="text-sm font-bold text-accent mb-2">
                            {response.name}
                          </h4>
                          <p className="text-xs text-softGray line-clamp-3">
                            {response.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

