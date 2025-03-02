import { exchangeCodeForAccessToken, exchangeNpssoForCode } from "psn-api";

export async function getAuthorizationPsn() {
  const npsso = process.env.PSN_NPSSO_TOKEN;

  if (!npsso) {
    throw new Error("PSN_NPSSO_TOKEN is required");
  }

  try {
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    return authorization;
  } catch (error) {
    console.error("Error getting PSN authorization:", error);
    throw new Error("Failed to get PSN authorization");
  }
}
