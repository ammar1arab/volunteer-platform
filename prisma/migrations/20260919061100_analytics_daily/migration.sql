CREATE TABLE "analytics_daily" (
    "day" TEXT NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "members" INTEGER NOT NULL DEFAULT 0,
    "mobile" INTEGER NOT NULL DEFAULT 0,
    "desktop" INTEGER NOT NULL DEFAULT 0,
    "tablet" INTEGER NOT NULL DEFAULT 0,
    "google" INTEGER NOT NULL DEFAULT 0,
    "instagram" INTEGER NOT NULL DEFAULT 0,
    "facebook" INTEGER NOT NULL DEFAULT 0,
    "other" INTEGER NOT NULL DEFAULT 0,
    "chatTurns" INTEGER NOT NULL DEFAULT 0,
    "chatMembers" INTEGER NOT NULL DEFAULT 0,
    "chatGuests" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "models" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "analytics_daily_pkey" PRIMARY KEY ("day")
);
