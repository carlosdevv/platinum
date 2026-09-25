"use server";

import prisma from "@/lib/prismadb";
import { auth } from "@/lib/auth";

interface RemoveGameParams {
  name: string;
}

export async function removeGame(params: RemoveGameParams) {
  const { name } = params;
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!name) {
    throw new Error("Name is required");
  }

  try {
    const game = await prisma.game.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    await prisma.game.delete({
      where: {
        id: game.id,
      },
    });

    return game;
  } catch (error) {
    console.error("Error removing game:", error);
    throw new Error("Failed to remove game");
  }
}
