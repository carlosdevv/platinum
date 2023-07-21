export type ProfileDataResponse = {
  avatarUrl: string;
  aboutMe: string;
  trophySummary: {
    level: number;
    progress: number;
    bronzeCount: number;
    silverCount: number;
    goldCount: number;
    platinumCount: number;
  };
};
