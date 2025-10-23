"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-white mb-4">
              About <span className="text-accent">ChatBattles.ai</span>
            </h1>
            <p className="text-softGray text-xl mb-12">
              Empowering users to compare and choose the best AI for their needs
            </p>

            <div className="space-y-12 text-softGray">
              <section>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">⚔️</span>
                  Our Mission
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  In a world with countless AI models, each with unique strengths
                  and perspectives, we asked ourselves: <span className="text-white font-semibold">Why choose just one?</span>
                </p>
                <p className="text-lg leading-relaxed">
                  ChatBattles.ai was born from the belief that comparing AI
                  responses shouldn&apos;t be complicated. We make it simple,
                  visual, and free for everyone to see multiple AI perspectives
                  side-by-side in real-time.
                </p>
              </section>

              <section className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-8">
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
                  🎯 What We Do
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      ⚡ Instant Comparison
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Submit one prompt and watch four top AI models respond
                      simultaneously
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      🎨 Beautiful Interface
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Enjoy a sleek, futuristic design that makes AI comparison
                      effortless
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      💎 Completely Free
                    </h3>
                    <p className="text-sm leading-relaxed">
                      No subscriptions, no hidden fees—just pure AI power at
                      your fingertips
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      📝 History Tracking
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Save and revisit your favorite AI battles anytime
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">🤖</span>
                  The Models We Battle
                </h2>
                <div className="space-y-6">
                  <div className="bg-black/30 border-l-4 border-accent rounded-r-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      GPT-5
                    </h3>
                    <p className="leading-relaxed">
                      OpenAI&apos;s latest model, optimized for speed and
                      efficiency without compromising on intelligence. Perfect
                      for quick, accurate responses with vision capabilities.
                    </p>
                  </div>
                  <div className="bg-black/30 border-l-4 border-red-500 rounded-r-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Lima-4
                    </h3>
                    <p className="leading-relaxed">
                      Meta&apos;s powerful Llama-based model with exceptional
                      conversational abilities. Known for its balanced approach
                      to reasoning and natural language understanding.
                    </p>
                  </div>
                  <div className="bg-black/30 border-l-4 border-amber-500 rounded-r-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      DeepSeek v3.1
                    </h3>
                    <p className="leading-relaxed">
                      Advanced reasoning model excelling at complex problem-solving,
                      technical analysis, and deep dives into challenging topics.
                    </p>
                  </div>
                  <div className="bg-black/30 border-l-4 border-blue-500 rounded-r-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Google Gemini 2.5 Pro
                    </h3>
                    <p className="leading-relaxed">
                      Google&apos;s multimodal AI with advanced vision capabilities.
                      Excels at image analysis, creative tasks, and providing
                      well-balanced, comprehensive responses.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">💡</span>
                  Why We Built This
                </h2>
                <div className="space-y-4 text-lg leading-relaxed">
                  <p>
                    As AI enthusiasts, we found ourselves constantly switching
                    between different AI platforms to compare responses. It was
                    time-consuming and frustrating.
                  </p>
                  <p>
                    We thought: <span className="text-white font-semibold italic">&quot;There has to be a better way.&quot;</span>
                  </p>
                  <p>
                    So we built ChatBattles.ai—a platform that brings multiple AI
                    models into one arena, letting them battle for the best
                    response. The result? <span className="text-accent font-semibold">Better insights, faster decisions,
                    and a more complete understanding</span> of any topic.
                  </p>
                </div>
              </section>

              <section className="bg-gradient-to-r from-accent/10 to-red-600/10 border border-accent/30 rounded-2xl p-8">
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  🌟 Our Values
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <div className="text-3xl mb-3">🔓</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Open Access
                    </h3>
                    <p className="text-sm">
                      AI power should be accessible to everyone, not just those
                      who can afford premium subscriptions
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Transparency
                    </h3>
                    <p className="text-sm">
                      We show you exactly what each AI thinks, with no hidden
                      algorithms or biased curation
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl mb-3">🚀</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Innovation
                    </h3>
                    <p className="text-sm">
                      We&apos;re constantly evolving, adding new models and features
                      based on your feedback
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">👨‍💻</span>
                  Built with Passion
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  ChatBattles.ai was created by <span className="text-accent font-semibold">Biraj</span>, a developer
                  passionate about making AI technology more accessible and
                  useful for everyone.
                </p>
                <p className="text-lg leading-relaxed">
                  Built with cutting-edge technologies including Next.js 15,
                  TypeScript, Tailwind CSS, Clerk authentication, and Supabase
                  database—all to provide you with the best AI comparison
                  experience.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">🔮</span>
                  What&apos;s Next?
                </h2>
                <p className="text-lg leading-relaxed mb-6">
                  We&apos;re just getting started! Here&apos;s what&apos;s on our roadmap:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">▸</span>
                    <span>More AI models to compare (Claude, Llama, Gemini, and more)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">▸</span>
                    <span>Custom model selection for personalized battles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">▸</span>
                    <span>Shareable battle results for easy collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">▸</span>
                    <span>Advanced analytics and model comparison metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">▸</span>
                    <span>Community features and public battle archives</span>
                  </li>
                </ul>
              </section>

              <section className="text-center bg-black/50 border-2 border-accent/50 rounded-2xl p-12 glow-orange">
                <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
                  Ready to Battle?
                </h2>
                <p className="text-lg text-softGray mb-8">
                  Join thousands of users comparing AI responses every day
                </p>
                <Link
                  href="/chat"
                  className="inline-block px-12 py-4 gradient-orange text-white text-xl font-bold rounded-2xl glow-orange-strong hover:scale-110 transition-all duration-300"
                >
                  Start Your First Battle
                </Link>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

