-- Google Meet integration: Activity meeting sync columns + related tables

ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingLinkSource" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingCode" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingSpaceName" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingSyncStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingSyncError" TEXT;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "meetingSyncedAt" TIMESTAMP(3);
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT 'Asia/Amman';

UPDATE "activities"
SET "meetingLinkSource" = 'MANUAL'
WHERE "meetingLink" IS NOT NULL
  AND ("meetingLinkSource" IS NULL OR "meetingLinkSource" = 'MANUAL');

CREATE INDEX IF NOT EXISTS "activities_meetingSyncStatus_idx" ON "activities"("meetingSyncStatus");

CREATE TABLE IF NOT EXISTS "activity_presenters" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "presenterId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PRIMARY',
    "topic" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_presenters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "activity_presenters_activityId_presenterId_key"
  ON "activity_presenters"("activityId", "presenterId");
CREATE INDEX IF NOT EXISTS "activity_presenters_activityId_idx" ON "activity_presenters"("activityId");
CREATE INDEX IF NOT EXISTS "activity_presenters_presenterId_idx" ON "activity_presenters"("presenterId");

DO $$ BEGIN
  ALTER TABLE "activity_presenters"
    ADD CONSTRAINT "activity_presenters_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "activity_presenters"
    ADD CONSTRAINT "activity_presenters_presenterId_fkey"
    FOREIGN KEY ("presenterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "meeting_integrations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'GOOGLE_MEET',
    "organizerEmail" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "encryptedRefreshToken" TEXT NOT NULL,
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "lastError" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "connectedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_integrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "meeting_integrations_provider_key" ON "meeting_integrations"("provider");

DO $$ BEGIN
  ALTER TABLE "meeting_integrations"
    ADD CONSTRAINT "meeting_integrations_connectedById_fkey"
    FOREIGN KEY ("connectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "meeting_sync_operations" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "lastError" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_sync_operations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "meeting_sync_operations_dedupeKey_key" ON "meeting_sync_operations"("dedupeKey");
CREATE INDEX IF NOT EXISTS "meeting_sync_operations_status_scheduledFor_idx"
  ON "meeting_sync_operations"("status", "scheduledFor");
CREATE INDEX IF NOT EXISTS "meeting_sync_operations_activityId_idx" ON "meeting_sync_operations"("activityId");

DO $$ BEGIN
  ALTER TABLE "meeting_sync_operations"
    ADD CONSTRAINT "meeting_sync_operations_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "activity_meeting_reports" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "conferenceId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "importedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_meeting_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "activity_meeting_reports_activityId_key" ON "activity_meeting_reports"("activityId");
CREATE INDEX IF NOT EXISTS "activity_meeting_reports_status_idx" ON "activity_meeting_reports"("status");

DO $$ BEGIN
  ALTER TABLE "activity_meeting_reports"
    ADD CONSTRAINT "activity_meeting_reports_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "activity_meeting_attendees" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "signedInEmail" TEXT,
    "matchedUserId" TEXT,
    "matchStatus" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "attendedSeconds" INTEGER NOT NULL DEFAULT 0,
    "firstJoinedAt" TIMESTAMP(3),
    "lastLeftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_meeting_attendees_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "activity_meeting_attendees_reportId_idx" ON "activity_meeting_attendees"("reportId");
CREATE INDEX IF NOT EXISTS "activity_meeting_attendees_matchedUserId_idx" ON "activity_meeting_attendees"("matchedUserId");

DO $$ BEGIN
  ALTER TABLE "activity_meeting_attendees"
    ADD CONSTRAINT "activity_meeting_attendees_reportId_fkey"
    FOREIGN KEY ("reportId") REFERENCES "activity_meeting_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "activity_meeting_attendees"
    ADD CONSTRAINT "activity_meeting_attendees_matchedUserId_fkey"
    FOREIGN KEY ("matchedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
