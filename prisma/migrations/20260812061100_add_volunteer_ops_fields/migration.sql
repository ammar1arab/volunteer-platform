-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable volunteer_profiles
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "educationLevel" "EducationLevel";
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "preferredVolunteerTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "membershipNumber" TEXT;

-- AlterTable pending_registrations
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "membershipNumber" TEXT;
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT;
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "preferredVolunteerTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "hasVolunteerExperience" BOOLEAN DEFAULT false;
