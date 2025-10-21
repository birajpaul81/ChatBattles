"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Toast from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import { Search, Download, Filter, Trash2, CheckSquare, Square } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const { toast, showToast, hideToast } = useToast();
  const ITEMS_PER_PAGE = 10;

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      const data = await response.json();

      console.log("Fetch chats response:", data);

      if (data.success) {
        setChats(data.data || []);
      } else {
        console.error("Failed to fetch chats:", data.error);
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/chats", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setChats([]);
        showToast("Chat history cleared successfully", "success");
      } else {
        showToast("Failed to clear history", "error");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      showToast("Error clearing history", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportChat = (chat: Chat) => {
    const content = `Prompt: ${chat.prompt}\n\nDate: ${new Date(chat.created_at).toLocaleString()}\n\n${chat.responses.map(r => `${r.name}:\n${r.text}\n\n`).join("---\n\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date(chat.created_at).getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Chat exported successfully", "success");
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedChats.size === paginatedChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(paginatedChats.map(chat => chat.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedChats.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedChats.size} selected chat(s)? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedChats).map(chatId =>
        fetch(`/api/chats?id=${chatId}`, { method: "DELETE" })
      );
      
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(r => r.ok);

      if (allSuccessful) {
        setChats(prev => prev.filter(chat => !selectedChats.has(chat.id)));
        setSelectedChats(new Set());
        showToast(`${selectedChats.size} chat(s) deleted successfully`, "success");
      } else {
        showToast("Some chats failed to delete", "error");
      }
    } catch (error) {
      console.error("Error deleting chats:", error);
      showToast("Error deleting chats", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadSelected = () => {
    if (selectedChats.size === 0) return;

    const selectedChatData = chats.filter(chat => selectedChats.has(chat.id));
    
    // Download each chat as a separate file
    selectedChatData.forEach((chat, index) => {
      // Add a small delay between downloads to avoid browser blocking
      setTimeout(() => {
        handleExportChat(chat);
      }, index * 100);
    });
    
    showToast(`${selectedChats.size} chat(s) will be downloaded separately`, "success");
  };

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    let filtered = chats;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((chat) =>
        chat.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.responses.some((r) => r.text.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  }, [chats, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredChats.length / ITEMS_PER_PAGE);
  const paginatedChats = filteredChats.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
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
                <Image
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt={user?.fullName || "User"}
                  width={64}
                  height={64}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-orbitron font-bold text-white">
                Chat History
                {filteredChats.length > 0 && (
                  <span className="text-sm text-softGray ml-2">({filteredChats.length})</span>
                )}
                {selectedChats.size > 0 && (
                  <span className="text-sm text-accent ml-2">({selectedChats.size} selected)</span>
                )}
              </h2>
              <div className="flex gap-2">
                {selectedChats.size > 0 && (
                  <>
                    <button
                      onClick={handleDownloadSelected}
                      className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm text-accent transition-all duration-200 flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download ({selectedChats.size})
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm text-red-500 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete ({selectedChats.size})
                    </button>
                  </>
                )}
                {chats.length > 0 && selectedChats.size === 0 && (
                  <button
                    onClick={handleClearHistory}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm text-red-500 transition-all duration-200 disabled:opacity-50"
                  >
                    {isDeleting ? "Clearing..." : "Clear All History"}
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filter */}
            {chats.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-softGray" size={20} />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl text-white placeholder-softGray/50 focus:border-accent focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={20} className="text-softGray" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                      className="px-4 py-3 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl text-white focus:border-accent focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
                {filteredChats.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg text-accent hover:border-accent transition-all"
                  >
                    {selectedChats.size === paginatedChats.length ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                    {selectedChats.size === paginatedChats.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
            )}

            {isLoading ? (
              <LoadingSkeleton type="profile" count={3} />
            ) : filteredChats.length === 0 && searchQuery ? (
              <div className="text-center py-20 bg-black/30 backdrop-blur-sm border border-accent/20 rounded-xl">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                  No results found
                </h3>
                <p className="text-softGray">
                  Try adjusting your search terms
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg text-accent transition-all"
                >
                  Clear Search
                </button>
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
              <>
                <div className="space-y-4">
                  {paginatedChats.map((chat, index) => {
                    const isSelected = selectedChats.has(chat.id);
                    return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-black/50 backdrop-blur-sm border rounded-xl p-6 hover:border-accent/50 transition-all duration-300 ${
                      isSelected ? "border-accent" : "border-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <button
                        onClick={() => toggleChatSelection(chat.id)}
                        className="mt-1 p-1 hover:bg-accent/10 rounded transition-all"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-accent" />
                        ) : (
                          <Square size={20} className="text-softGray" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {chat.prompt}
                        </h3>
                        <span className="text-xs text-softGray">
                          {new Date(chat.created_at).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleExportChat(chat)}
                        className="ml-4 p-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-all"
                        title="Export chat"
                      >
                        <Download size={18} />
                      </button>
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
                  );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-all"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              currentPage === pageNum
                                ? "bg-accent text-white"
                                : "bg-black/50 border border-accent/30 text-softGray hover:border-accent hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

