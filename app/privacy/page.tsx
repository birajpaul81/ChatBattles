"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-softGray mb-8">
              Last updated: October 18, 2025
            </p>

            <div className="space-y-8 text-softGray">
              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  1. Introduction
                </h2>
                <p className="leading-relaxed">
                  ChatBattles.ai ("we," "our," or "us") is committed to
                  protecting your privacy. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when you
                  use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-accent mb-3 mt-4">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-white">Account Information:</strong> Name,
                    email address, and password (managed by Clerk)
                  </li>
                  <li>
                    <strong className="text-white">Prompts & Chats:</strong> The
                    questions and messages you submit to AI models
                  </li>
                  <li>
                    <strong className="text-white">Profile Data:</strong> Any
                    additional information you choose to add to your profile
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-accent mb-3 mt-4">
                  2.2 Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-white">Usage Data:</strong> Pages
                    visited, features used, time spent on the Service
                  </li>
                  <li>
                    <strong className="text-white">Device Information:</strong>{" "}
                    Browser type, operating system, IP address
                  </li>
                  <li>
                    <strong className="text-white">Analytics:</strong> Vercel
                    Analytics tracks page views and performance metrics
                  </li>
                  <li>
                    <strong className="text-white">Cookies:</strong> Authentication
                    tokens and session management
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="leading-relaxed mb-4">We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain the Service</li>
                  <li>Process your prompts through AI models</li>
                  <li>Store your chat history for your convenience</li>
                  <li>Authenticate your account and prevent unauthorized access</li>
                  <li>Analyze usage patterns to improve the Service</li>
                  <li>Send important Service updates and notifications</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  4. Third-Party Services
                </h2>
                <p className="leading-relaxed mb-4">
                  We use the following third-party services that may collect your
                  information:
                </p>

                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      Clerk (Authentication)
                    </h3>
                    <p className="leading-relaxed">
                      Manages user authentication and account security.
                      <br />
                      Privacy Policy:{" "}
                      <a
                        href="https://clerk.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        clerk.com/privacy
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      Supabase (Database)
                    </h3>
                    <p className="leading-relaxed">
                      Stores your chat history and user data.
                      <br />
                      Privacy Policy:{" "}
                      <a
                        href="https://supabase.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        supabase.com/privacy
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      A4F API (AI Models)
                    </h3>
                    <p className="leading-relaxed">
                      Processes your prompts through AI models. Your prompts may be
                      subject to A4F's data policies.
                      <br />
                      Website:{" "}
                      <a
                        href="https://www.a4f.co/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        a4f.co
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      Vercel (Hosting & Analytics)
                    </h3>
                    <p className="leading-relaxed">
                      Hosts the Service and collects analytics data.
                      <br />
                      Privacy Policy:{" "}
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        vercel.com/legal/privacy-policy
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  5. Data Storage and Security
                </h2>
                <p className="leading-relaxed mb-4">
                  We implement appropriate security measures to protect your
                  information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted data transmission (HTTPS/SSL)</li>
                  <li>Secure authentication via Clerk</li>
                  <li>Database access controls</li>
                  <li>Regular security audits</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  However, no method of transmission over the internet is 100%
                  secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  6. Data Retention
                </h2>
                <p className="leading-relaxed">
                  We retain your information for as long as your account is active
                  or as needed to provide the Service. You can delete your chat
                  history at any time from your profile page. Upon account
                  deletion, we will remove your personal information within 30
                  days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  7. Your Rights
                </h2>
                <p className="leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-white">Access:</strong> Request a copy
                    of your data
                  </li>
                  <li>
                    <strong className="text-white">Correction:</strong> Update
                    inaccurate information
                  </li>
                  <li>
                    <strong className="text-white">Deletion:</strong> Request
                    deletion of your account and data
                  </li>
                  <li>
                    <strong className="text-white">Export:</strong> Download your
                    chat history
                  </li>
                  <li>
                    <strong className="text-white">Opt-out:</strong> Disable
                    analytics cookies
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="leading-relaxed">
                  ChatBattles.ai is not intended for users under 13 years of age.
                  We do not knowingly collect information from children. If you
                  believe we have collected information from a child, please
                  contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  9. International Users
                </h2>
                <p className="leading-relaxed">
                  Your information may be transferred to and processed in
                  countries other than your own. By using the Service, you consent
                  to such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  10. Changes to Privacy Policy
                </h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new policy on this page
                  and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="leading-relaxed">
                  If you have questions or concerns about this Privacy Policy,
                  please contact us through our website.
                </p>
              </section>

              <section className="bg-black/50 border border-accent/30 rounded-xl p-6">
                <p className="text-white font-semibold mb-4">
                  📧 Data Protection Summary
                </p>
                <ul className="space-y-2 text-sm">
                  <li>✅ We do NOT sell your data</li>
                  <li>✅ We do NOT share your prompts publicly</li>
                  <li>✅ You can delete your data anytime</li>
                  <li>✅ We use encryption to protect your data</li>
                  <li>✅ Third-party services have their own privacy policies</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

