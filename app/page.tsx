"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-5xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-black text-white mb-6 leading-tight"
              animate={{
                textShadow: [
                  "0 0 20px rgba(253, 99, 22, 0.5)",
                  "0 0 40px rgba(253, 99, 22, 0.8)",
                  "0 0 20px rgba(253, 99, 22, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Battle the smartest AIs —{" "}
              <span className="text-accent">all in one chat.</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-softGray mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Compare answers from{" "}
              <span className="text-accent font-semibold">GPT-5-Nano</span>,{" "}
              <span className="text-red-500 font-semibold">Grok-4</span>, and{" "}
              <span className="text-amber-500 font-semibold">DeepSeek</span> in
              real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/chat"
                className="inline-block px-12 py-5 gradient-orange text-white text-xl font-bold rounded-2xl glow-orange-strong hover:scale-110 transition-all duration-300"
              >
                Start Chatting Free
              </Link>
            </motion.div>

            <motion.div
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <FeatureCard
                icon="⚔️"
                title="Battle Mode"
                description="Compare AI responses side-by-side in real-time"
                delay={0}
              />
              <FeatureCard
                icon="🚀"
                title="3 Top Models"
                description="GPT-5-Nano, Grok-4, and DeepSeek at your fingertips"
                delay={0.1}
              />
              <FeatureCard
                icon="💎"
                title="100% Free"
                description="No subscriptions, no hidden fees, just pure AI power"
                delay={0.2}
              />
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 + delay }}
      className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-8 hover:border-accent hover:glow-orange transition-all duration-300"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-orbitron font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-softGray">{description}</p>
    </motion.div>
  );
}

