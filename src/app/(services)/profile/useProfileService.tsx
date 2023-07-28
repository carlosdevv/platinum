import { AxiosError } from "axios";
import { UseQueryOptions, useQuery } from "react-query";
import { getProfileData } from ".";
import { ProfileDataResponse } from "./types";

export const useGetProfileData = (
  props?: string,
  options?: UseQueryOptions<ProfileDataResponse, AxiosError>
) =>
  useQuery<ProfileDataResponse, AxiosError>(
    ["profile", props],
    () => getProfileData(props),
    {
      ...options,
    }
  );
