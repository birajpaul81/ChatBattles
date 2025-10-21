"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  type = "success", 
  isVisible, 
  onClose,
  duration = 3000 
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const colors = {
    success: "bg-green-500/20 border-green-500 text-green-500",
    error: "bg-red-500/20 border-red-500 text-red-500",
    info: "bg-accent/20 border-accent text-accent",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={`px-6 py-3 rounded-xl border-2 backdrop-blur-md ${colors[type]} flex items-center gap-3 shadow-2xl`}>
            <span className="text-xl font-bold">{icons[type]}</span>
            <span className="font-semibold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
