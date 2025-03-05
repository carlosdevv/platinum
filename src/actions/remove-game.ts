"use server";

import prisma from "@/lib/prismadb";

interface RemoveGameParams {
  name: string;
  userId: string;
}

export async function removeGame(params: RemoveGameParams) {
  const { name, userId } = params;

  if (!name || !userId) {
    throw new Error("Name and userId are required");
  }

  try {
    const game = await prisma.game.findFirst({
      where: {
        name,
        userId,
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
