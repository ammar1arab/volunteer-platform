-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "JordanianCity" AS ENUM ('AMMAN', 'ZARQA', 'IRBID', 'AQABA', 'SALT', 'MAFRAQ', 'KARAK', 'MADABA', 'JERASH', 'AJLOUN', 'TAFILAH', 'MAAN', 'OUTOFJORDAN');

-- CreateTable
CREATE TABLE "volunteer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" "JordanianCity" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "profilePictureUrl" TEXT,
    "gender" "Gender",
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasVolunteerExperience" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "maxVolunteers" INTEGER NOT NULL,
    "currentVolunteers" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_participations" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_participations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_userId_key" ON "volunteer_profiles"("userId");

-- CreateIndex
CREATE INDEX "volunteer_profiles_userId_idx" ON "volunteer_profiles"("userId");

-- CreateIndex
CREATE INDEX "activities_status_date_idx" ON "activities"("status", "date");

-- CreateIndex
CREATE INDEX "activities_createdBy_idx" ON "activities"("createdBy");

-- CreateIndex
CREATE INDEX "activity_participations_activityId_idx" ON "activity_participations"("activityId");

-- CreateIndex
CREATE INDEX "activity_participations_volunteerId_idx" ON "activity_participations"("volunteerId");

-- CreateIndex
CREATE INDEX "activity_participations_status_idx" ON "activity_participations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participations_activityId_volunteerId_key" ON "activity_participations"("activityId", "volunteerId");

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participations" ADD CONSTRAINT "activity_participations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participations" ADD CONSTRAINT "activity_participations_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
