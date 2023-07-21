import { AxiosError } from "axios";
import { UseQueryOptions, useQuery } from "react-query";
import { getGameData } from ".";
import { GameDataResponse } from "./types";

export const useGetGameData = (
  options?: UseQueryOptions<GameDataResponse[], AxiosError>
) =>
  useQuery<GameDataResponse[], AxiosError>(["gameData"], () => getGameData(), {
    ...options,
  });
