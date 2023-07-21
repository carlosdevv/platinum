import api from "@/lib/api";
import { GameDataResponse } from "./types";

export const getGameData = async (): Promise<GameDataResponse[]> => {
  const url = "/api/psn";

  const { data } = await api.get(url);

  return data.result;
};
