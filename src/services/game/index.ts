import api from "@/lib/api";
import {
  FetchPsnGamesResponse,
  type FetchSteamGamesResponse,
  type SteamGameDetailsResponse,
} from "./types";

export const fetchPsnGames = async (): Promise<FetchPsnGamesResponse[]> => {
  const { data } = await api.get("/api/psn");
  return data.result;
};

export const fetchPsnGameDetails = async (
  gameId: string
): Promise<FetchPsnGamesResponse> => {
  const { data } = await api.get(`/api/psn/game/${gameId}`);
  return data.result;
};

export const fetchSteamGames = async (
  steamUserId: string
): Promise<FetchSteamGamesResponse[]> => {
  const { data } = await api.get(`/api/steam?steamUserId=${steamUserId}`);
  return data.result;
};

export const fetchSteamGameDetails = async (
  gameName: string
): Promise<SteamGameDetailsResponse> => {
  const { data } = await api.get(`/api/steam/search?game=${gameName}`);
  return data;
};
