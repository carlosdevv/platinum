"use server";

import prisma from "@/lib/prismadb";
import { auth } from "@/lib/auth";

interface AddGameParams {
  name: string;
  platform: string;
  lastPlayed?: Date;
  iconUrl: string;
  hasPlatinum?: boolean;
  externalGameId?: string;
  trackAchievements?: boolean;
  status?: "not_started" | "playing" | "completed";
  tagIds?: string[];
}

export async function addGame(params: AddGameParams) {
  const { name, platform, lastPlayed, iconUrl, hasPlatinum = true, externalGameId, trackAchievements = false, status = "completed", tagIds = [] } = params;
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!name || !["PC", "Console", "Outro"].includes(platform)) {
    throw new Error("Name and platform are required");
  }
  if (!["not_started", "playing", "completed"].includes(status)) throw new Error("Status inválido.");

  try {
    const appId = externalGameId?.trim();
    const connection = trackAchievements && platform === "PC" && appId && /^\d+$/.test(appId)
      ? await prisma.gameConnection.findUnique({
          where: { userId_provider: { userId: session.user.id, provider: "steam" } },
          select: { id: true },
        })
      : null;
    const shouldTrackSteam = Boolean(connection && appId);
    const uniqueTagIds = [...new Set(tagIds)].slice(0, 12);
    if (platform === "PC" && uniqueTagIds.length) throw new Error("Tags só podem ser usadas em Console ou Outro.");
    const tags = uniqueTagIds.length
      ? await prisma.tag.findMany({ where: { id: { in: uniqueTagIds }, userId: session.user.id }, select: { id: true } })
      : [];
    if (tags.length !== uniqueTagIds.length) throw new Error("Uma ou mais tags não pertencem à sua conta.");

    if (shouldTrackSteam) {
      const duplicate = await prisma.game.findFirst({
        where: { userId: session.user.id, externalGameId: appId },
        select: { id: true },
      });
      if (duplicate) throw new Error("Este jogo já está vinculado à sua biblioteca.");

      const existingManual = await prisma.game.findFirst({
        where: { userId: session.user.id, source: "manual", platform: "PC", externalGameId: null, name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      });
      if (existingManual) {
        return prisma.game.update({
          where: { id: existingManual.id },
          data: { externalGameId: appId, achievementStatus: "pending", achievementsSyncedAt: null, hasPlatinum: false, status: "playing" },
        });
      }
    }

    const game = await prisma.game.create({
      data: {
        name,
        platform,
        lastPlayed,
        userId: session.user.id,
        iconUrl,
        hasPlatinum: shouldTrackSteam ? false : status === "completed" && hasPlatinum,
        status: shouldTrackSteam ? "playing" : status,
        ...(tags.length ? { tags: { create: tags.map((tag) => ({ tag: { connect: { id: tag.id } } })) } } : {}),
        ...(shouldTrackSteam ? {
          source: "steam",
          externalGameId: appId,
          achievementStatus: "pending",
        } : {}),
      },
    });

    return game;
  } catch (error) {
    if (error instanceof Error && ["Este jogo já está vinculado à sua biblioteca.", "Tags só podem ser usadas em Console ou Outro.", "Uma ou mais tags não pertencem à sua conta.", "Status inválido."].includes(error.message)) throw error;
    console.error("Error adding game:", error);
    throw new Error("Failed to add game");
  }
}
