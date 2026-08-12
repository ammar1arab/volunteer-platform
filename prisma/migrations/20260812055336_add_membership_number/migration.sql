-- AlterTable
ALTER TABLE "volunteer_profiles" ADD COLUMN IF NOT EXISTS "membershipNumber" TEXT;

-- AlterTable
ALTER TABLE "pending_registrations" ADD COLUMN IF NOT EXISTS "membershipNumber" TEXT;
