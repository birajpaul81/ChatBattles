"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Command } from "lucide-react";
import { useEffect } from "react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const shortcuts = [
    { key: "Enter", description: "Submit prompt" },
    { key: "Shift + Enter", description: "New line in prompt" },
    { key: "Esc", description: "Clear conversation" },
    { key: "?", description: "Toggle shortcuts (this modal)" },
    { key: "Ctrl/Cmd + K", description: "Focus search (coming soon)" },
  ];

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
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-black/95 backdrop-blur-md border-2 border-accent/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Command className="text-accent" size={24} />
                  <h2 className="text-2xl font-orbitron font-bold text-white">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent/20 text-softGray hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-accent/20 hover:border-accent/40 transition-all"
                  >
                    <span className="text-softGray">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-accent/20 border border-accent/40 rounded text-accent font-mono text-sm">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-accent/20">
                <p className="text-xs text-softGray text-center">
                  Press <kbd className="px-2 py-1 bg-accent/20 rounded text-accent">Esc</kbd> or click outside to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
