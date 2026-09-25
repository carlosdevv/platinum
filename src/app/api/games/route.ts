import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import type { GameImageFit, GameImagePosition } from "@/lib/game-artwork";
import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ code: "UNAUTHENTICATED", message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
    }

    const params = new URL(request.url).searchParams;
    const filter = params.get("filter") ?? "platinados";
    const rawPage = Number(params.get("page") ?? 0);
    const tagId = params.get("tagId");
    const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
    const where: Prisma.GameWhereInput = { userId: session.user.id, isHidden: false };
    if (filter === "platinados") where.hasPlatinum = true;
    else if (filter === "console" || filter === "ps5") where.platform = "Console";
    else if (filter === "pc") where.platform = "PC";
    else if (filter === "outro") where.platform = "Outro";
    else if (filter !== "todos") return NextResponse.json({ code: "INVALID_FILTER", message: "O filtro selecionado é inválido." }, { status: 400 });
    if (tagId) where.tags = { some: { tagId, tag: { userId: session.user.id } } };

    const [games, total, platinumCount, consoleCount, pcCount, outroCount] = await Promise.all([
      prisma.game.findMany({
        where,
        include: { tags: { include: { tag: { select: { id: true, name: true, color: true } } } } },
        orderBy: [{ lastPlayed: { sort: "desc", nulls: "last" } }, { id: "asc" }],
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.game.count({ where }),
      prisma.game.count({ where: { userId: session.user.id, isHidden: false, hasPlatinum: true } }),
      prisma.game.count({ where: { userId: session.user.id, isHidden: false, platform: "Console", hasPlatinum: true } }),
      prisma.game.count({ where: { userId: session.user.id, isHidden: false, platform: "PC", hasPlatinum: true } }),
      prisma.game.count({ where: { userId: session.user.id, isHidden: false, platform: "Outro", hasPlatinum: true } }),
    ]);

    return NextResponse.json({
      games,
      page,
      pageSize: PAGE_SIZE,
      total,
      counts: { platinum: platinumCount, console: consoleCount, pc: pcCount, outro: outroCount },
    });
  } catch (error) {
    console.error("[GAMES_GET]", error);
    return NextResponse.json({ code: "GAMES_QUERY_FAILED", message: "Não foi possível consultar sua biblioteca agora." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (typeof id !== "string" || !id) {
      return new NextResponse("Game ID is required", { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.externalGameId) {
      await prisma.game.update({ where: { id: game.id }, data: { isHidden: true } });
    } else {
      await prisma.game.delete({ where: { id: game.id } });
    }

    return new NextResponse("Game removed successfully", { status: 200 });
  } catch (error) {
    console.error("[GAMES_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, iconUrl, lastPlayed, platform, imageFit, imagePosition, status, tagIds } = body;

    if (typeof id !== "string" || !id) {
      return new NextResponse("Game ID is required", { status: 400 });
    }

    const validFits: GameImageFit[] = ["auto", "cover", "contain"];
    const validPositions: GameImagePosition[] = ["center", "top", "bottom", "left", "right"];
    if (
      (imageFit !== undefined && !validFits.includes(imageFit)) ||
      (imagePosition !== undefined && !validPositions.includes(imagePosition))
    ) {
      return new NextResponse("Invalid image framing", { status: 400 });
    }
    const validPlatforms = ["PC", "Console", "Outro"];
    const validStatuses = ["not_started", "playing", "completed"];
    if ((platform !== undefined && !validPlatforms.includes(platform)) || (status !== undefined && !validStatuses.includes(status))) {
      return new NextResponse("Plataforma ou status inválido", { status: 400 });
    }
    if (tagIds !== undefined && (!Array.isArray(tagIds) || tagIds.some((value) => typeof value !== "string") || tagIds.length > 12)) {
      return new NextResponse("Lista de tags inválida", { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    const normalizedTagIds = tagIds === undefined ? undefined : [...new Set(tagIds as string[])];
    if (normalizedTagIds?.length && (platform ?? game.platform) === "PC") {
      return new NextResponse("Tags só podem ser usadas em Console ou Outro", { status: 400 });
    }
    if (normalizedTagIds?.length) {
      const ownedTags = await prisma.tag.count({ where: { id: { in: normalizedTagIds }, userId: session.user.id } });
      if (ownedTags !== normalizedTagIds.length) return new NextResponse("Uma ou mais tags não pertencem à sua conta", { status: 403 });
    }

    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        iconUrl: iconUrl || null,
        lastPlayed: lastPlayed ? new Date(lastPlayed) : null,
        platform: platform || game.platform,
        ...(status ? { status } : {}),
        imageFit: imageFit ?? game.imageFit,
        imagePosition: imagePosition ?? game.imagePosition,
        ...(normalizedTagIds !== undefined ? {
          tags: {
            deleteMany: {},
            create: normalizedTagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
          },
        } : {}),
      },
    });

    return new NextResponse("Game updated successfully", { status: 200 });
  } catch (error) {
    console.error("[GAMES_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
