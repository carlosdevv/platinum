import { Suspense, type ReactNode } from "react";
import { PrivateGameProviders } from "@/providers/private-game-providers";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      <PrivateGameProviders>{children}</PrivateGameProviders>
    </Suspense>
  );
}
