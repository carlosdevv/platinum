import { NextApiRequest, NextApiResponse } from "next";
import * as psn from "psn-api";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const PSN_NPSSO_TOKEN =
    "uKgAcxmBJp1yTDM3PRU9tmPKCvJ22hsBu2s3SOfMouEJp1f7gUzECr9aNUZQUZVW";

  const accessCode = await psn.exchangeNpssoForCode(PSN_NPSSO_TOKEN);
  const authorization = await psn.exchangeCodeForAccessToken(accessCode);

  const {
    data: { gameLibraryTitlesRetrieve: recentlyPlayedGames },
  } = await psn.getRecentlyPlayedGames({
    accessToken: authorization.accessToken,
  });

  const trophies = await psn.getUserTitles(
    { accessToken: authorization.accessToken },
    "me"
  );

  const result = recentlyPlayedGames.games
    // Some games are marked as UNKNOWN. It appears that these are games
    // downloaded or played by another user on the same console
    .filter((g) => g.platform !== "UNKNOWN")
    .map((game) => {
      // This is a kludgy method for matching a recently played title with ist
      // corresponding trophy data. The game list often has an extended name,
      // e.g "CRISIS CORE –FINAL FANTASY VII– REUNION" vs "CRISIS CORE –FINAL FANTASY VII– REUNION　PS4 & PS5"
      // Might need to be replaced with some approximate string matching algo
      const trophiesForGame = trophies.trophyTitles.find((t) =>
        game.name.includes(t.trophyTitleName)
      );
      let progress!: number;
      let totalTrophies!: number;
      let earnedTrophies!: number;
      let hasPlatinum!: boolean;

      if (trophiesForGame) {
        totalTrophies = Object.values(trophiesForGame.definedTrophies).reduce(
          (total, current) => total + current
        );
        earnedTrophies = Object.values(trophiesForGame.earnedTrophies).reduce(
          (total, current) => total + current
        );

        hasPlatinum = trophiesForGame.earnedTrophies.platinum === 1;

        progress = Math.round((earnedTrophies / totalTrophies) * 100);
      }

      return {
        totalTrophies,
        earnedTrophies,
        iconUrl: game.image.url,
        platform: game.platform,
        name: game.name,
        progress,
        lastPlayed: new Date(game.lastPlayedDateTime).getTime(),
        hasPlatinum,
      };
    });

  return res.json({ result });
}
