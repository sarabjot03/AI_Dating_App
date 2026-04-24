-- AlterTable
ALTER TABLE "User"
ADD COLUMN "intent" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "energy" TEXT,
ADD COLUMN "aboutLine" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "promptsJson" JSONB,
ADD COLUMN "onboardedAt" TIMESTAMP(3);
