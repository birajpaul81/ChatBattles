"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const navLinks = [
    { href: "/", label: "Home" },
    ...(isSignedIn
      ? [
          { href: "/chat", label: "Chat" },
          { href: "/profile", label: "Profile" },
        ]
      : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-accent/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 group"
          >
            <span className="text-2xl font-orbitron font-black text-white group-hover:text-accent transition-colors">
              ChatBattles
              <span className="text-accent">.ai</span>
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-accent"
                    : "text-softGray hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-accent/50",
                  },
                }}
              />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-softGray hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 gradient-orange text-white text-sm font-semibold rounded-lg glow-orange hover:scale-105 transition-transform"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

