"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const faqs = [
  {
    question: "What is ChatBattles.ai?",
    answer:
      "ChatBattles.ai is a platform that lets you interact with multiple AI models simultaneously and compare their responses side-by-side. Currently, we support GPT-5, Lima-4, DeepSeek v3.1, and Google Gemini 2.5 Pro.",
  },
  {
    question: "Is ChatBattles.ai really free?",
    answer:
      "Yes! ChatBattles.ai is completely free to use. We believe in democratizing access to AI technology. There are no hidden fees, subscriptions, or paywalls.",
  },
  {
    question: "Which AI models do you support?",
    answer:
      "We currently support four cutting-edge AI models: GPT-5 (from OpenAI), Lima-4 (Meta's Llama-based model), DeepSeek v3.1, and Google Gemini 2.5 Pro. Each model has unique strengths and response styles.",
  },
  {
    question: "How does the Battle Mode work?",
    answer:
      "When you submit a prompt, it's simultaneously sent to all four AI models. The responses appear side-by-side in real-time with a typewriter effect, allowing you to easily compare their answers, tone, and accuracy.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard encryption (HTTPS/SSL) and secure authentication via Clerk. Your chat history is stored securely in Supabase. We do NOT sell your data or share your prompts publicly. See our Privacy Policy for details.",
  },
  {
    question: "Can I delete my chat history?",
    answer:
      "Absolutely! You can clear your entire chat history from your Profile page with one click. You can also delete your account at any time, and all your data will be removed within 30 days.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "Yes, you need to sign up to use ChatBattles.ai. This allows us to save your chat history and provide a personalized experience. Sign-up is quick and free!",
  },
  {
    question: "Can I use ChatBattles.ai for commercial purposes?",
    answer:
      "Yes, you can use the AI responses for commercial purposes, subject to the terms of service of the respective AI model providers (OpenAI, X.ai, DeepSeek). Please review our Terms of Service for details.",
  },
  {
    question: "What can I use ChatBattles.ai for?",
    answer:
      "You can use ChatBattles.ai for anything! Get help with coding, writing, research, brainstorming, learning new topics, creative projects, and more. Compare different AI perspectives on any question.",
  },
  {
    question: "Are there any usage limits?",
    answer:
      "Currently, there are no strict usage limits for free users. However, we reserve the right to implement fair usage policies to ensure service availability for everyone.",
  },
  {
    question: "Can I export my chat history?",
    answer:
      "We're working on adding export functionality! Soon you'll be able to download your chat history in various formats. Stay tuned for updates.",
  },
  {
    question: "How accurate are the AI responses?",
    answer:
      "AI models are powerful but not perfect. Always verify important information from reliable sources. Different models may give different answers—that's why comparing them is valuable!",
  },
  {
    question: "Can I choose which models to battle?",
    answer:
      "Currently, all prompts are sent to all four models automatically. We're considering adding custom model selection in the future based on user feedback.",
  },
  {
    question: "What happens to my prompts?",
    answer:
      "Your prompts are processed by our AI model provider (A4F API) and stored in your chat history. We use anonymized data to improve the service. Your prompts are NOT shared publicly or used for training AI models.",
  },
  {
    question: "Can I share my battle results?",
    answer:
      "We're working on adding a sharing feature! Soon you'll be able to generate shareable links to your favorite AI battles.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "ChatBattles.ai is a web application that works great on mobile browsers! We don't have a native app yet, but our responsive design provides a smooth mobile experience.",
  },
  {
    question: "How can I report a bug or request a feature?",
    answer:
      "We'd love to hear from you! Visit our Contact page or reach out through our social media channels. Your feedback helps us improve!",
  },
  {
    question: "Will ChatBattles.ai always be free?",
    answer:
      "Our core features will always be free! We may introduce optional premium features in the future, but the fundamental AI battle experience will remain accessible to everyone.",
  },
];

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-white pr-4">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent text-2xl flex-shrink-0"
        >
          ▼
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-softGray leading-relaxed">{answer}</div>
      </motion.div>
    </motion.div>
  );
}

export default function FAQPage() {
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
              Frequently Asked Questions
            </h1>
            <p className="text-softGray text-lg mb-12">
              Everything you need to know about ChatBattles.ai
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-accent/10 to-red-600/10 border border-accent/30 rounded-xl p-8 text-center"
            >
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                Still have questions?
              </h2>
              <p className="text-softGray mb-6">
                Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help!
              </p>
              <a
                href="/chat"
                className="inline-block px-8 py-3 gradient-orange text-white font-bold rounded-xl glow-orange hover:scale-105 transition-all duration-300"
              >
                Start Chatting
              </a>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

