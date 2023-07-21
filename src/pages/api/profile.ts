import { NextApiRequest, NextApiResponse } from "next";
import * as psn from "psn-api";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const PSN_NPSSO_TOKEN =
    "uKgAcxmBJp1yTDM3PRU9tmPKCvJ22hsBu2s3SOfMouEJp1f7gUzECr9aNUZQUZVW";

  const accessCode = await psn.exchangeNpssoForCode(PSN_NPSSO_TOKEN);
  const authorization = await psn.exchangeCodeForAccessToken(accessCode);

  const { profile } = await psn.getProfileFromUserName(
    authorization,
    req.query.userName as string
  );

  const profileProps = {
    avatarUrl: profile.avatarUrls[0].avatarUrl,
    aboutMe: profile.aboutMe,
    trophySummary: {
      level: profile.trophySummary.level,
      progress: profile.trophySummary.progress,
      bronzeCount: profile.trophySummary.earnedTrophies.bronze,
      silverCount: profile.trophySummary.earnedTrophies.silver,
      goldCount: profile.trophySummary.earnedTrophies.gold,
      platinumCount: profile.trophySummary.earnedTrophies.platinum,
    },
  };

  return res.json({ profileProps });
}
