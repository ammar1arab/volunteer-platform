-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'UPCOMING',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "hours" INTEGER NOT NULL DEFAULT 0,
    "achievement" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "top_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "featured_posts_date_idx" ON "featured_posts"("date");

-- CreateIndex
CREATE INDEX "top_members_hours_idx" ON "top_members"("hours");
