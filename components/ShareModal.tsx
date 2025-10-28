"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X as CloseIcon, Link as LinkIcon, Facebook, Linkedin, Check } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleData?: {
    prompt: string;
    results: Array<{ model: string; name: string; text: string }>;
  };
}

// X (Twitter) Icon Component
const XIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ShareModal({ isOpen, onClose, battleData }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate shareable link (in a real implementation, this would create a unique URL)
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/chat" : "";
  const shareText = battleData
    ? `Check out this AI battle on ChatBattles.ai: "${battleData.prompt}"`
    : "Compare responses from GPT-5, Lima-4, DeepSeek, and Google Gemini on ChatBattles.ai";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
            <div className="bg-black/95 backdrop-blur-md border-2 border-accent/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white">
                  Share Battle
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent/20 text-softGray hover:text-white transition-all"
                  aria-label="Close"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              {/* Copy Link */}
              <div className="mb-4 sm:mb-6">
                <label className="text-sm text-softGray mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-accent/30 rounded-lg text-white text-xs sm:text-sm focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg text-accent transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm"
                  >
                    {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                    <span className="hidden xs:inline">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Social Share */}
              <div>
                <label className="text-sm text-softGray mb-2 sm:mb-3 block">Share on Social Media</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={shareOnTwitter}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 bg-black/50 hover:bg-blue-500/20 border border-accent/30 hover:border-blue-500/50 rounded-lg transition-all group"
                  >
                    <XIcon size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] sm:text-xs text-softGray group-hover:text-blue-400">X</span>
                  </button>
                  <button
                    onClick={shareOnFacebook}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 bg-black/50 hover:bg-blue-600/20 border border-accent/30 hover:border-blue-600/50 rounded-lg transition-all group"
                  >
                    <Facebook className="text-blue-600 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[10px] sm:text-xs text-softGray group-hover:text-blue-600">Facebook</span>
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 bg-black/50 hover:bg-blue-700/20 border border-accent/30 hover:border-blue-700/50 rounded-lg transition-all group"
                  >
                    <Linkedin className="text-blue-700 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[10px] sm:text-xs text-softGray group-hover:text-blue-700">LinkedIn</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-accent/20">
                <p className="text-[10px] sm:text-xs text-softGray text-center">
                  Note: Full battle sharing with results coming soon!
                </p>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
