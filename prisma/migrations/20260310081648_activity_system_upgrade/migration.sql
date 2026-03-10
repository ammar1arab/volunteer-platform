/*
  Warnings:

  - You are about to drop the column `address` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `targetAudience` on the `activities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activities" DROP COLUMN "address",
DROP COLUMN "targetAudience",
ADD COLUMN     "activityType" TEXT NOT NULL DEFAULT 'IN_PERSON',
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "city" TEXT,
ADD COLUMN     "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "externalMeetingId" TEXT,
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "meetingPlatform" TEXT,
ALTER COLUMN "placeName" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "activity_participations" ADD COLUMN     "attendanceStatus" TEXT NOT NULL DEFAULT 'NOT_MARKED',
ADD COLUMN     "markedAt" TIMESTAMP(3),
ADD COLUMN     "volunteerHours" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "volunteer_profiles" ADD COLUMN     "totalVolunteerHours" DOUBLE PRECISION NOT NULL DEFAULT 0;
