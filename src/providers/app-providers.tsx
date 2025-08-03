"use client";

import { Toaster } from "@/components/ui/sonner";
import { GameProvider } from "@/context/useGameContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode, useState } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NuqsAdapter>
          <GameProvider>
            {children}
            <Toaster />
          </GameProvider>
        </NuqsAdapter>
      </SessionProvider>
    </QueryClientProvider>
  );
}
