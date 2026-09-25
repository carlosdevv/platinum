import { NextResponse, type NextRequest } from "next/server";
import { steamPosterUrl } from "@/lib/game-artwork";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchQuery = request.nextUrl.searchParams.get("game");

  if (!searchQuery) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(
        searchQuery
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to search Steam games");
    }

    const results: { appid: number; name: string }[] = await response.json();

    const formattedResults = results.map((game) => ({
      appId: game.appid,
      name: game.name,
      iconUrl: steamPosterUrl(game.appid),
      logoUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/logo.png`,
    }));

    return NextResponse.json({
      results: formattedResults,
      total: formattedResults.length,
    });
  } catch (error) {
    console.error("Error searching Steam games:", error);
    return NextResponse.json(
      { error: "Failed to search Steam games" },
      { status: 500 }
    );
  }
}
