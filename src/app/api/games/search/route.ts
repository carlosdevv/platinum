import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Não autorizado", { status: 401 });
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2 || query.length > 100) return NextResponse.json({ games: [] });

  const games = await prisma.game.findMany({
    where: { userId: session.user.id, isHidden: false, name: { contains: query, mode: "insensitive" } },
    select: { id: true, name: true, iconUrl: true, platform: true },
    orderBy: { name: "asc" },
    take: 20,
  });
  return NextResponse.json({ games });
}
