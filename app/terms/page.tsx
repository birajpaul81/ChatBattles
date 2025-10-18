"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-softGray mb-8">
              Last updated: October 18, 2025
            </p>

            <div className="space-y-8 text-softGray">
              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="leading-relaxed">
                  By accessing and using ChatBattles.ai ("the Service"), you
                  accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to these terms, please do
                  not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  2. Description of Service
                </h2>
                <p className="leading-relaxed mb-4">
                  ChatBattles.ai provides a platform for users to interact with
                  multiple AI models simultaneously and compare their responses.
                  The Service currently includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access to GPT-5-Nano, Grok-4, and DeepSeek v3.1 models</li>
                  <li>Side-by-side AI response comparison</li>
                  <li>Chat history storage</li>
                  <li>User authentication and profile management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  3. User Responsibilities
                </h2>
                <p className="leading-relaxed mb-4">You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the Service in compliance with all applicable laws</li>
                  <li>Not use the Service for illegal or harmful purposes</li>
                  <li>Not attempt to bypass any limitations or security measures</li>
                  <li>Not abuse, harass, or harm other users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  4. Acceptable Use
                </h2>
                <p className="leading-relaxed mb-4">
                  You may NOT use ChatBattles.ai to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Generate harmful, abusive, or illegal content</li>
                  <li>Violate intellectual property rights</li>
                  <li>Spread misinformation or malicious content</li>
                  <li>Attempt to reverse engineer the Service</li>
                  <li>Scrape or harvest data without permission</li>
                  <li>Overload or disrupt the Service infrastructure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  5. Intellectual Property
                </h2>
                <p className="leading-relaxed">
                  The Service, including its original content, features, and
                  functionality, is owned by ChatBattles.ai and is protected by
                  international copyright, trademark, and other intellectual
                  property laws. AI-generated responses are provided as-is and
                  may be subject to the terms of the respective AI model
                  providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  6. User Content
                </h2>
                <p className="leading-relaxed">
                  You retain ownership of the prompts you submit to the Service.
                  By using the Service, you grant us a license to store and
                  process your prompts to provide the Service. We may use
                  anonymized data to improve the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  7. Third-Party Services
                </h2>
                <p className="leading-relaxed mb-4">
                  ChatBattles.ai integrates with third-party services including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Clerk (Authentication)</li>
                  <li>Supabase (Database)</li>
                  <li>A4F API (AI Models)</li>
                  <li>Vercel (Hosting & Analytics)</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  Your use of these services is subject to their respective
                  terms and conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  8. Service Availability
                </h2>
                <p className="leading-relaxed">
                  We strive to provide continuous service availability but do
                  not guarantee uninterrupted access. The Service may be
                  unavailable due to maintenance, updates, or technical issues.
                  We reserve the right to modify or discontinue the Service at
                  any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  9. Disclaimer of Warranties
                </h2>
                <p className="leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND,
                  EXPRESS OR IMPLIED. We do not guarantee the accuracy,
                  reliability, or completeness of AI-generated responses. Users
                  should verify important information independently.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  10. Limitation of Liability
                </h2>
                <p className="leading-relaxed">
                  ChatBattles.ai and its creators shall not be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages resulting from your use or inability to use the
                  Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  11. Account Termination
                </h2>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate your account if
                  you violate these terms or engage in abusive behavior. You may
                  also delete your account at any time through your profile
                  settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  12. Changes to Terms
                </h2>
                <p className="leading-relaxed">
                  We may update these Terms of Service from time to time. We will
                  notify users of any material changes by posting the new terms
                  on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  13. Contact Information
                </h2>
                <p className="leading-relaxed">
                  If you have questions about these Terms of Service, please
                  contact us through our website or email.
                </p>
              </section>

              <section className="bg-black/50 border border-accent/30 rounded-xl p-6">
                <p className="text-white font-semibold">
                  By using ChatBattles.ai, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

