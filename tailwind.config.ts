import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        accent: "#FD6316",
        text: "#FFFFFF",
        softGray: "#BFBFBF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(253, 99, 22, 0.5), 0 0 40px rgba(253, 99, 22, 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(253, 99, 22, 0.8), 0 0 60px rgba(253, 99, 22, 0.5)" 
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

