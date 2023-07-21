import api from "@/lib/api";
import { ProfileDataResponse } from "./types";

export const getProfileData = async (
  props?: string
): Promise<ProfileDataResponse> => {
  const url = "/api/profile";

  const { data } = await api.get(url, {
    params: {
      userName: props,
    },
  });

  return data.profileProps;
};
