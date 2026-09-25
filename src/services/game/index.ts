import api from "@/lib/api";
import {
    type SteamGameDetailsResponse,
} from "./types";

export const fetchSteamGameDetails = async (
  gameName: string
): Promise<SteamGameDetailsResponse> => {
  const { data } = await api.get(`/api/steam/search?game=${encodeURIComponent(gameName)}`);
  return data;
};
