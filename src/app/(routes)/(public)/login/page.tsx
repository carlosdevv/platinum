"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    try {
      signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error when signing in");
    }
  };

  return (
    <div className="ps5-gradient min-h-screen relative overflow-hidden">
      <div className="floating-orbs" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 via-yellow-500/30 to-yellow-600/20 rounded-full blur-xl animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-6xl font-light tracking-wide text-white ps5-text-glow">
                Platinum
              </h1>
              <p className="text-white/60 text-lg font-light">
                Track your gaming achievements
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Button
              onClick={handleGoogleSignIn}
              className="group relative h-16 w-full overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 p-[2px] rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl" />
              <div className="relative flex items-center justify-center gap-3 h-full w-full bg-gray-900/90 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <span className="text-white font-medium text-lg">
                  Continue with Google
                </span>
              </div>
            </Button>

            {/* Additional info */}
            <div className="text-center">
              <p className="text-white/40 text-sm">
                Sign in to sync your Steam games and track your platinum
                trophies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
