"use server";

import prisma from "@/lib/prismadb";

interface AddGameParams {
  name: string;
  platform: string;
  lastPlayed?: Date;
  userId: string;
  iconUrl: string;
  hasPlatinum?: boolean;
}

export async function addGame(params: AddGameParams) {
  const { name, platform, lastPlayed, userId, iconUrl, hasPlatinum = true } = params;

  if (!name || !platform) {
    throw new Error("Name and platform are required");
  }

  try {
    const game = await prisma.game.create({
      data: {
        name,
        platform,
        lastPlayed,
        userId,
        iconUrl,
        hasPlatinum,
      },
    });

    return game;
  } catch (error) {
    console.error("Error adding game:", error);
    throw new Error("Failed to add game");
  }
}
