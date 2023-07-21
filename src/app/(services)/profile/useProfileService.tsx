import { AxiosError } from "axios";
import { UseQueryOptions, useQuery } from "react-query";
import { ProfileDataResponse } from "./types";
import { getProfileData } from ".";

export const useGetProfileData = (
  props?: string,
  options?: UseQueryOptions<ProfileDataResponse, AxiosError>
) =>
  useQuery<ProfileDataResponse, AxiosError>(["profile"], () => getProfileData(props), {
    ...options,
  });
