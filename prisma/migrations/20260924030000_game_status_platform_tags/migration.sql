ALTER TABLE "Game"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'completed';

UPDATE "Game"
SET "status" = CASE WHEN "source" = 'steam' AND "hasPlatinum" = false THEN 'playing' ELSE 'completed' END;

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "normalizedName" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameTag" (
  "gameId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "GameTag_pkey" PRIMARY KEY ("gameId", "tagId")
);

CREATE UNIQUE INDEX "Tag_userId_normalizedName_key" ON "Tag"("userId", "normalizedName");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
CREATE INDEX "GameTag_tagId_idx" ON "GameTag"("tagId");

ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameTag" ADD CONSTRAINT "GameTag_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameTag" ADD CONSTRAINT "GameTag_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the old PS5 label as a reusable per-user tag while normalizing the
-- platform category to Console.
INSERT INTO "Tag" ("id", "name", "normalizedName", "userId", "updatedAt")
SELECT 'legacy-playstation-' || "userId", 'PlayStation', 'playstation', "userId", CURRENT_TIMESTAMP
FROM "Game"
WHERE "platform" IN ('PS5', 'PlayStation')
GROUP BY "userId";

INSERT INTO "GameTag" ("gameId", "tagId")
SELECT game."id", tag."id"
FROM "Game" game
JOIN "Tag" tag ON tag."userId" = game."userId" AND tag."normalizedName" = 'playstation'
WHERE game."platform" IN ('PS5', 'PlayStation');

UPDATE "Game" SET "platform" = 'Console' WHERE "platform" IN ('PS5', 'PlayStation');
