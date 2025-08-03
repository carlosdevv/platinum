import api from "@/lib/api";
import {
    type FetchSteamGamesResponse,
    type SteamGameDetailsResponse,
} from "./types";

export const fetchSteamGames = async (
  steamUserId: string
): Promise<FetchSteamGamesResponse[]> => {
  try {
    const response = await api.get(`/api/steam?steamUserId=${steamUserId}`);
    
    if (!response.data || !response.data.result) {
      return [];
    }
    
    return response.data.result;
  } catch (error) {
    console.error("Error fetching Steam games:", error);
    return [];
  }
};

export const fetchSteamGameDetails = async (
  gameName: string
): Promise<SteamGameDetailsResponse> => {
  const { data } = await api.get(`/api/steam/search?game=${gameName}`);
  return data;
};
