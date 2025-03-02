export interface FetchPsnGamesResponse {
  iconUrl: string;
  name: string;
  platform: string;
  progress: number;
  totalTrophies: number;
  earnedTrophies: number;
  hasPlatinum: boolean;
  lastPlayed: number;
  npCommunicationId?: string;
  trophySetVersion?: string;
}

export interface FetchSteamGamesResponse {
  iconUrl: string;
  name: string;
  platform: string;
  progress: number;
  totalAchievements: number;
  earnedAchievements: number;
  isCompleted: boolean;
  lastPlayed: number;
  appId?: string;
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
