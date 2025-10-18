"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-auto py-8 border-t border-accent/20 bg-black/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-softGray text-sm">
            © 2025 ChatBattles.ai — Made with{" "}
            <span className="text-accent">⚡</span> by{" "}
            <span className="text-accent font-semibold">Biraj</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

