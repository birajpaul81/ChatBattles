import { SignUp } from "@clerk/nextjs";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-black/80 backdrop-blur-xl border border-accent/30 shadow-2xl",
              headerTitle: "text-white font-orbitron",
              headerSubtitle: "text-softGray",
              socialButtonsBlockButton:
                "bg-black/50 border border-accent/30 hover:border-accent/50 text-white",
              formButtonPrimary: "gradient-orange glow-orange hover:scale-105",
              footerActionLink: "text-accent hover:text-accent/80",
              formFieldInput:
                "bg-black/50 border-accent/30 text-white focus:border-accent",
              formFieldLabel: "text-softGray",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-accent",
            },
          }}
        />
      </div>
    </div>
  );
}

