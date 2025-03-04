"use server";

import prisma from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

interface AddGameParams {
  name: string;
  platform: string;
  lastPlayed?: Date;
  userId: string;
  iconUrl: string;
}

export async function addGame(params: AddGameParams) {
  const { name, platform, lastPlayed, userId, iconUrl } = params;

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
      },
    });

    revalidatePath("/");

    return game;
  } catch (error) {
    console.error("Error adding game:", error);
    throw new Error("Failed to add game");
  }
}
