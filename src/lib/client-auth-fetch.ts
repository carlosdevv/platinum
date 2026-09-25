"use client";

import { getSession, signIn } from "next-auth/react";

let recoveryInFlight: Promise<boolean> | null = null;
let loginRedirectStarted = false;

async function refreshSession(): Promise<boolean> {
  if (!recoveryInFlight) {
    recoveryInFlight = getSession()
      .then((session) => Boolean(session?.user?.id))
      .catch(() => false)
      .finally(() => {
        recoveryInFlight = null;
      });
  }
  return recoveryInFlight;
}

async function redirectToLogin() {
  if (loginRedirectStarted || typeof window === "undefined") return;
  loginRedirectStarted = true;
  const callbackUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  await signIn("google", { callbackUrl });
}

/** Fetch a protected app API, refresh the NextAuth session once on 401, then
 * return to Google sign-in if the session is no longer valid. */
export async function fetchWithSession(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401 || typeof window === "undefined") return response;

  const hasSession = await refreshSession();
  if (!hasSession) {
    await redirectToLogin();
    return response;
  }

  // RequestInit bodies used by this app are strings or absent, so they can be
  // safely sent again after refreshing the session.
  const retry = await fetch(input, init);
  if (retry.status === 401) await redirectToLogin();
  return retry;
}
