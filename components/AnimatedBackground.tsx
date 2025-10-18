"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(253, 99, 22, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(253, 99, 22, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(253, 99, 22, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, rgba(253, 99, 22, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(253, 99, 22, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
      
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}

