export type GameDataResponse = {
  totalTrophies: number | undefined;
  earnedTrophies: number | undefined;
  iconUrl: string;
  platform: string;
  name: string;
  progress: number | undefined;
  lastPlayed: number;
  hasPlatinum: boolean | undefined;
};
