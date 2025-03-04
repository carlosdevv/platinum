import { AxiosError } from "axios";
import { UseQueryOptions, useQuery } from "react-query";
import {
  fetchPsnGameDetails,
  fetchPsnGames,
  fetchSteamGameDetails,
  fetchSteamGames,
} from ".";
import {
  FetchPsnGamesResponse,
  type FetchSteamGamesResponse,
  type SteamGameDetailsResponse,
} from "./types";

export const useFetchPsnGames = (
  options?: UseQueryOptions<FetchPsnGamesResponse[], AxiosError>
) =>
  useQuery<FetchPsnGamesResponse[], AxiosError>(
    ["psn-games"],
    () => fetchPsnGames(),
    {
      ...options,
    }
  );

export const useFetchPsnGameDetails = (
  gameId: string,
  options?: UseQueryOptions<FetchPsnGamesResponse, AxiosError>
) =>
  useQuery<FetchPsnGamesResponse, AxiosError>(
    ["psn-game-details", gameId],
    () => fetchPsnGameDetails(gameId),
    {
      ...options,
    }
  );

export const useFetchSteamGames = (
  props: {
    steamUserId: string;
  },
  options?: UseQueryOptions<FetchSteamGamesResponse[], AxiosError>
) =>
  useQuery<FetchSteamGamesResponse[], AxiosError>(
    ["steam-games"],
    () => fetchSteamGames(props.steamUserId),
    {
      ...options,
    }
  );

export const useFetchSteamGameDetails = (
  gameName: string,
  options?: UseQueryOptions<SteamGameDetailsResponse, AxiosError>
) =>
  useQuery<SteamGameDetailsResponse, AxiosError>(
    ["steam-game-details", gameName],
    () => fetchSteamGameDetails(gameName),
    {
      ...options,
    }
  );
