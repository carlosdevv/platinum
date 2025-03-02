import { getCachedData, setCachedData } from "@/lib/cache";
import { getAuthorizationPsn } from "@/lib/psn/config";
import { NextResponse } from "next/server";
import { getUserTitles } from "psn-api";

// Chave para o cache
const CACHE_KEY = "psn-platinum-games";

export async function GET() {
  try {
    const cachedData = getCachedData(CACHE_KEY);

    if (cachedData) {
      return NextResponse.json({ result: cachedData });
    }

    const authorization = await getAuthorizationPsn();

    const trophiesResponse = await getUserTitles(
      { accessToken: authorization.accessToken },
      "me"
    );

    const platinumGames = trophiesResponse.trophyTitles
      .filter((game) => game.earnedTrophies.platinum === 1)
      .map((game) => {
        const totalTrophies = Object.values(game.definedTrophies).reduce(
          (a, b) => a + b,
          0
        );
        const earnedTrophies = Object.values(game.earnedTrophies).reduce(
          (a, b) => a + b,
          0
        );
        const progress = Math.round((earnedTrophies / totalTrophies) * 100);

        return {
          iconUrl: game.trophyTitleIconUrl,
          name: game.trophyTitleName,
          platform: game.trophyTitlePlatform,
          progress,
          totalTrophies,
          earnedTrophies,
          hasPlatinum: true,
          lastPlayed: new Date(game.lastUpdatedDateTime).getTime(),
          trophySetVersion: game.trophySetVersion,
          npCommunicationId: game.npCommunicationId,
        };
      });

    setCachedData(CACHE_KEY, platinumGames);

    return NextResponse.json({ result: platinumGames });
  } catch (error) {
    console.error("PSN API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch PSN data" },
      { status: 500 }
    );
  }
}
