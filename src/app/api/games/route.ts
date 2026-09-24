import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import type { GameImageFit, GameImagePosition } from "@/lib/game-artwork";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const games = await prisma.game.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastPlayed: "desc",
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("[GAMES_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    await prisma.game.delete({
      where: {
        id: game.id,
      },
    });

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
    const { name, iconUrl, lastPlayed, platform, imageFit, imagePosition } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const validFits: GameImageFit[] = ["auto", "cover", "contain"];
    const validPositions: GameImagePosition[] = ["center", "top", "bottom", "left", "right"];
    if (
      (imageFit !== undefined && !validFits.includes(imageFit)) ||
      (imagePosition !== undefined && !validPositions.includes(imagePosition))
    ) {
      return new NextResponse("Invalid image framing", { status: 400 });
    }

    const game = await prisma.game.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        iconUrl: iconUrl || null,
        lastPlayed: lastPlayed ? new Date(lastPlayed) : null,
        platform: platform || game.platform,
        imageFit: imageFit ?? game.imageFit,
        imagePosition: imagePosition ?? game.imagePosition,
      },
    });

    return new NextResponse("Game updated successfully", { status: 200 });
  } catch (error) {
    console.error("[GAMES_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
