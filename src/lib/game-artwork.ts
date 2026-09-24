export type GameImageFit = "auto" | "cover" | "contain";
export type GameImagePosition = "center" | "top" | "bottom" | "left" | "right";

const steamHosts = new Set([
  "cdn.akamai.steamstatic.com",
  "cdn.cloudflare.steamstatic.com",
]);

export function steamPosterUrl(appId: string | number, host = "cdn.cloudflare.steamstatic.com") {
  return `https://${host}/steam/apps/${appId}/library_600x900_2x.jpg`;
}

export function gameArtworkCandidates(imageUrl?: string | null): string[] {
  if (!imageUrl) return [];

  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/^\/steam\/apps\/(\d+)\/(?:header|library_600x900(?:_2x)?)\.jpg$/);
    if (url.protocol !== "https:" || !steamHosts.has(url.hostname) || !match) return [imageUrl];

    const base = `https://${url.hostname}/steam/apps/${match[1]}`;
    return [
      `${base}/library_600x900_2x.jpg`,
      `${base}/library_600x900.jpg`,
      `${base}/header.jpg`,
    ];
  } catch {
    return [imageUrl];
  }
}

export function isOptimizedGameArtwork(imageUrl: string) {
  try {
    return steamHosts.has(new URL(imageUrl).hostname);
  } catch {
    return false;
  }
}

export function resolvedImageFit(imageUrl: string, fit: GameImageFit): "cover" | "contain" {
  if (fit !== "auto") return fit;
  return /\/library_600x900(?:_2x)?\.jpg$/.test(imageUrl) ? "cover" : "contain";
}
