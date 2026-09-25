ALTER TABLE "Game"
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN "externalGameId" TEXT,
  ADD COLUMN "playtimeMinutes" INTEGER,
  ADD COLUMN "progress" INTEGER,
  ADD COLUMN "earnedAchievements" INTEGER,
  ADD COLUMN "totalAchievements" INTEGER,
  ADD COLUMN "lastAchievementName" TEXT,
  ADD COLUMN "lastAchievementAt" TIMESTAMP(3),
  ADD COLUMN "achievementStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "achievementsSyncedAt" TIMESTAMP(3);

DROP INDEX "Game_name_userId_key";
CREATE UNIQUE INDEX "Game_userId_source_externalGameId_key" ON "Game"("userId", "source", "externalGameId");
CREATE INDEX "Game_userId_hasPlatinum_lastPlayed_idx" ON "Game"("userId", "hasPlatinum", "lastPlayed");

CREATE TABLE "GameConnection" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalUserId" TEXT NOT NULL,
  "lastSyncedAt" TIMESTAMP(3),
  "syncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GameConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameConnection_userId_provider_key" ON "GameConnection"("userId", "provider");
CREATE INDEX "GameConnection_provider_externalUserId_idx" ON "GameConnection"("provider", "externalUserId");
ALTER TABLE "GameConnection" ADD CONSTRAINT "GameConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
