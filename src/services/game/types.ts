interface GameProps {
  iconUrl: string;
  name: string;
  platform: string;
  hasPlatinum?: boolean;
  lastPlayed: number;
}
export interface FetchPsnGamesResponse extends GameProps {
  progress?: number;
  totalTrophies?: number;
  earnedTrophies?: number;
  npCommunicationId?: string;
  trophySetVersion?: string;
}

export interface FetchSteamGamesResponse extends GameProps {
  appId?: string;
  progress?: number;
  totalAchievements?: number;
  earnedAchievements?: number;
  isCompleted?: boolean;
}

export type DatabaseGameResponse = GameProps & {
  lastPlayed: Date;
};

export interface SteamGameDetailsResponse {
  results: {
    appid: string;
    name: string;
    iconUrl?: string;
    logoUrl?: string;
  }[];
  total: number;
}

export interface TrophyCount {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface GameDetails extends FetchPsnGamesResponse {
  trophies: TrophyCount;
  description?: string;
  releaseDate?: string;
}
