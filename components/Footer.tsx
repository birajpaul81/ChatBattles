"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const footerLinks = [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-auto py-8 border-t border-accent/20 bg-black/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-softGray hover:text-accent transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
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

