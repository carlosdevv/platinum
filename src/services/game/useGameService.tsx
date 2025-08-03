"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSteamGameDetails } from ".";
import { SteamGameDetailsResponse } from "./types";

interface UseFetchSteamGameDetailsOptions {
  enabled?: boolean;
}

export const useFetchSteamGameDetails = (
  gameName: string,
  options?: UseFetchSteamGameDetailsOptions
) => {
  return useQuery<SteamGameDetailsResponse>({
    queryKey: ["steam-game-details", gameName],
    queryFn: () => fetchSteamGameDetails(gameName),
    enabled: options?.enabled,
  });
};
