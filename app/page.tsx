"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-accent text-white rounded-lg"
      >
        Skip to main content
      </a>
      
      <AnimatedBackground />
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-20">
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

            {/* Battle Mode Section */}
            <motion.div
              className="mt-32 mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white mb-4">
                ⚔️ Battle Mode in Action
              </h2>
              <p className="text-softGray text-lg mb-12 max-w-2xl mx-auto">
                See how three AI models compete to give you the best answer
              </p>

              {/* Example Battle Showcase */}
              <div className="bg-gradient-to-br from-accent/10 via-purple-600/10 to-red-600/10 border-2 border-accent/40 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto">
                {/* Question Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-10 text-center"
                >
                  <div className="text-accent font-semibold mb-2 text-sm uppercase tracking-wider">
                    Your Question
                  </div>
                  <p className="text-white text-xl md:text-2xl font-medium">
                    &ldquo;Explain quantum computing in simple terms&rdquo;
                  </p>
                </motion.div>

                {/* Three AI Responses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <BattleModeCard
                    modelName="GPT-5-Nano"
                    modelColor="orange"
                    responsePreview="Quantum computers use qubits that can exist in multiple states simultaneously through superposition..."
                    badge="Most Detailed"
                    delay={0}
                  />
                  <BattleModeCard
                    modelName="Grok-4"
                    modelColor="red"
                    responsePreview="Think of quantum computing as a massive parallel processor that explores many solutions at once..."
                    badge="Best Analogy"
                    delay={0.1}
                  />
                  <BattleModeCard
                    modelName="DeepSeek"
                    modelColor="amber"
                    responsePreview="Quantum computing leverages quantum mechanics principles to perform calculations exponentially faster..."
                    badge="Most Concise"
                    delay={0.2}
                  />
                </div>

                {/* Battle Mode Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.9 }}
                  className="mt-10 text-center"
                >
                  <div className="inline-block bg-black/60 backdrop-blur-sm border border-accent/40 rounded-xl px-6 py-4">
                    <p className="text-white text-sm md:text-base">
                      <span className="text-accent font-bold">⚡ Instant comparison</span> • 
                      <span className="text-white mx-2">Three perspectives</span> • 
                      <span className="text-accent font-bold">Best answer wins</span>
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              className="mt-32 mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white mb-4">
                How It Works
              </h2>
              <p className="text-softGray text-lg mb-12 max-w-2xl mx-auto">
                Get the best AI insights in 3 simple steps
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <StepCard
                  number="1"
                  icon="✍️"
                  title="Ask Your Question"
                  description="Type any question, problem, or prompt you want to explore"
                  delay={0}
                />
                <StepCard
                  number="2"
                  icon="⚡"
                  title="AI Models Battle"
                  description="Your prompt is simultaneously sent to GPT-5-Nano, Grok-4, and DeepSeek v3.1"
                  delay={0.1}
                />
                <StepCard
                  number="3"
                  icon="🎯"
                  title="Compare & Choose"
                  description="View all three responses side-by-side and pick the best answer for your needs"
                  delay={0.2}
                />
              </div>

              <motion.div
                className="mt-16 bg-gradient-to-r from-accent/10 to-red-600/10 border border-accent/30 rounded-2xl p-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                <h3 className="text-2xl font-orbitron font-bold text-white mb-4">
                  🤖 Why Multiple AI Models?
                </h3>
                <div className="text-left text-softGray space-y-3">
                  <p>
                    <span className="text-white font-semibold">Different strengths:</span> Each AI model excels at different tasks—coding, creative writing, analysis, or conversation.
                  </p>
                  <p>
                    <span className="text-white font-semibold">Better accuracy:</span> Comparing multiple responses helps you identify the most reliable and comprehensive answer.
                  </p>
                  <p>
                    <span className="text-white font-semibold">Unique perspectives:</span> Get diverse viewpoints and approaches to solve your problems more effectively.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="mt-32"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <div className="bg-gradient-to-r from-accent/20 to-red-600/20 border-2 border-accent/50 rounded-3xl p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-orbitron font-black text-white mb-4">
                  Ready to Compare AI Models?
                </h2>
                <p className="text-softGray text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are making smarter decisions with AI battles
                </p>
                <Link
                  href="/chat"
                  className="inline-block px-12 py-5 gradient-orange text-white text-xl font-bold rounded-2xl glow-orange-strong hover:scale-110 transition-all duration-300"
                >
                  Start Your First Battle
                </Link>
                <p className="text-xs text-softGray mt-4">
                  No credit card required • 100% Free
                </p>
              </div>
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

function StepCard({
  number,
  icon,
  title,
  description,
  delay,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 + delay }}
      className="bg-black/50 backdrop-blur-sm border-2 border-accent/30 rounded-2xl p-8 hover:border-accent hover:glow-orange transition-all duration-300 relative"
    >
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-accent to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {number}
      </div>
      <div className="text-5xl mb-4 mt-6 text-center">{icon}</div>
      <h3 className="text-xl font-orbitron font-bold text-white mb-3 text-center">
        {title}
      </h3>
      <p className="text-softGray text-center leading-relaxed">{description}</p>
    </motion.div>
  );
}

function BattleModeCard({
  modelName,
  modelColor,
  responsePreview,
  badge,
  delay,
}: {
  modelName: string;
  modelColor: "orange" | "red" | "amber";
  responsePreview: string;
  badge: string;
  delay: number;
}) {
  const colorClasses = {
    orange: {
      border: "border-accent/50",
      glow: "hover:glow-orange",
      badge: "bg-gradient-to-r from-accent to-orange-600",
      icon: "bg-gradient-to-br from-accent to-orange-600",
    },
    red: {
      border: "border-red-500/50",
      glow: "hover:glow-red",
      badge: "bg-gradient-to-r from-red-500 to-red-700",
      icon: "bg-gradient-to-br from-red-500 to-red-700",
    },
    amber: {
      border: "border-amber-500/50",
      glow: "hover:glow-amber",
      badge: "bg-gradient-to-r from-amber-500 to-amber-700",
      icon: "bg-gradient-to-br from-amber-500 to-amber-700",
    },
  };

  const colors = colorClasses[modelColor];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.7 + delay }}
      className={`bg-black/60 backdrop-blur-sm border-2 ${colors.border} rounded-2xl p-6 ${colors.glow} transition-all duration-300 relative`}
    >
      {/* Model Name Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colors.icon}`}></div>
          <h3 className="text-white font-orbitron font-bold text-lg">
            {modelName}
          </h3>
        </div>
        <div className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
          {badge}
        </div>
      </div>

      {/* Response Preview */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[140px] flex items-center">
        <p className="text-softGray text-sm leading-relaxed italic">
          &ldquo;{responsePreview}&rdquo;
        </p>
      </div>

      {/* Animated Typing Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
        <div className="flex gap-1">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${colors.icon}`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${colors.icon}`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${colors.icon}`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
        </div>
        <span>AI responding...</span>
      </div>
    </motion.div>
  );
}

