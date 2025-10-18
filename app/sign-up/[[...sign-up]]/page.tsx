import { SignUp } from "@clerk/nextjs";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-xl border-2 border-accent/50 shadow-[0_0_50px_rgba(253,99,22,0.3)] rounded-2xl p-8",
              headerTitle: "text-white font-orbitron text-2xl font-bold",
              headerSubtitle: "text-softGray text-base",
              socialButtonsBlockButton:
                "bg-white/10 border-2 border-white/20 hover:border-accent/50 text-white font-semibold rounded-xl hover:bg-white/20 transition-all",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "gradient-orange glow-orange hover:scale-105 text-white font-bold rounded-xl py-3 transition-all",
              footerActionLink: "text-accent hover:text-accent/80 font-semibold",
              formFieldInput:
                "bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl py-3 px-4",
              formFieldLabel: "text-white font-semibold mb-2",
              formFieldInputShowPasswordButton: "text-accent hover:text-accent/80",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-accent hover:text-accent/80",
              dividerLine: "bg-white/20",
              dividerText: "text-softGray",
              footerActionText: "text-softGray",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              formFieldWarningText: "text-yellow-400",
              footerPages: "bg-black/50 border border-accent/30 rounded-xl",
              otpCodeFieldInput: "bg-white/10 border-2 border-white/20 text-white focus:border-accent rounded-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

