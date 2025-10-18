"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-white mb-4 text-center">
              Get in Touch
            </h1>
            <p className="text-softGray text-lg mb-12 text-center max-w-2xl mx-auto">
              Have questions, feedback, or feature requests? We'd love to hear
              from you!
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-black/50 backdrop-blur-sm border-2 border-accent/30 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
                  Send us a Message
                </h2>

                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4"
                  >
                    <p className="text-green-400 font-semibold">
                      ✅ Message sent successfully! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-white font-semibold mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl py-3 px-4 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-white font-semibold mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl py-3 px-4 outline-none transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-white font-semibold mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border-2 border-white/20 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl py-3 px-4 outline-none transition-all"
                    >
                      <option value="" className="bg-black">
                        Select a subject
                      </option>
                      <option value="general" className="bg-black">
                        General Inquiry
                      </option>
                      <option value="bug" className="bg-black">
                        Bug Report
                      </option>
                      <option value="feature" className="bg-black">
                        Feature Request
                      </option>
                      <option value="feedback" className="bg-black">
                        Feedback
                      </option>
                      <option value="support" className="bg-black">
                        Technical Support
                      </option>
                      <option value="partnership" className="bg-black">
                        Partnership
                      </option>
                      <option value="other" className="bg-black">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-white font-semibold mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl py-3 px-4 outline-none transition-all resize-none"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isSubmitting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "gradient-orange text-white glow-orange hover:scale-105"
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
                    Other Ways to Reach Us
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📧</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Email
                        </h3>
                        <a
                          href="mailto:support@chatbattles.ai"
                          className="text-accent hover:underline"
                        >
                          support@chatbattles.ai
                        </a>
                        <p className="text-sm text-softGray mt-1">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-3xl">💬</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Live Chat
                        </h3>
                        <p className="text-softGray">
                          Available Monday - Friday
                          <br />
                          9:00 AM - 5:00 PM EST
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🐦</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Social Media
                        </h3>
                        <p className="text-softGray mb-2">
                          Follow us for updates and news
                        </p>
                        <div className="flex gap-3">
                          <a
                            href="https://twitter.com/chatbattles"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors"
                          >
                            Twitter
                          </a>
                          <span className="text-softGray">•</span>
                          <a
                            href="https://github.com/birajpaul81"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors"
                          >
                            GitHub
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-accent/10 to-red-600/10 border border-accent/30 rounded-2xl p-8"
                >
                  <h2 className="text-xl font-orbitron font-bold text-white mb-4">
                    📚 Quick Resources
                  </h2>
                  <div className="space-y-3">
                    <a
                      href="/faq"
                      className="block text-softGray hover:text-accent transition-colors"
                    >
                      → FAQ - Common questions answered
                    </a>
                    <a
                      href="/about"
                      className="block text-softGray hover:text-accent transition-colors"
                    >
                      → About - Learn more about us
                    </a>
                    <a
                      href="/terms"
                      className="block text-softGray hover:text-accent transition-colors"
                    >
                      → Terms of Service
                    </a>
                    <a
                      href="/privacy"
                      className="block text-softGray hover:text-accent transition-colors"
                    >
                      → Privacy Policy
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-black/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-8"
                >
                  <h2 className="text-xl font-orbitron font-bold text-white mb-4">
                    🐛 Report a Bug
                  </h2>
                  <p className="text-softGray mb-4">
                    Found a bug? Help us improve by reporting it!
                  </p>
                  <a
                    href="https://github.com/birajpaul81/ChatBattles/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-white/10 border border-white/20 hover:border-accent/50 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    Report on GitHub →
                  </a>
                </motion.div>
              </div>
            </div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 bg-black/30 border border-accent/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
                Before you reach out...
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Check the FAQ
                  </h3>
                  <p className="text-sm text-softGray">
                    Most common questions are already answered there
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Search First
                  </h3>
                  <p className="text-sm text-softGray">
                    Your question might already be answered
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Be Specific
                  </h3>
                  <p className="text-sm text-softGray">
                    Include details to help us help you better
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

