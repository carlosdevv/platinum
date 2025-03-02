"use client";

import { Icons } from "@/components/icons";
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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-6 px-6">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-2xl font-light">Platinum</h1>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="text-white hover:text-white h-12 w-full overflow-hidden bg-gradient-to-r from-rose-500 via-[#fbbc05] to-[#4285f4] p-[1px]"
                onClick={handleGoogleSignIn}
              >
                <Icons.Google className="size-5" />
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
