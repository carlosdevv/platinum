import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Não autorizado", { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return new NextResponse("ID obrigatório", { status: 400 });

  const game = await prisma.game.findFirst({
    where: { id, userId: session.user.id, isHidden: false },
    select: { id: true, lastPlayed: true },
  });
  if (!game) return new NextResponse("Jogo não encontrado", { status: 404 });

  const before = await prisma.game.count({
    where: {
      userId: session.user.id,
      isHidden: false,
      OR: game.lastPlayed ? [
        { lastPlayed: { gt: game.lastPlayed } },
        { lastPlayed: game.lastPlayed, id: { lt: game.id } },
      ] : [
        { lastPlayed: { not: null } },
        { lastPlayed: null, id: { lt: game.id } },
      ],
    },
  });
  return NextResponse.json({ page: Math.floor(before / PAGE_SIZE), index: before % PAGE_SIZE });
}
