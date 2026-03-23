ALTER TABLE "otp_codes" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "pending_registrations" (
  "id"          TEXT         NOT NULL,
  "email"       TEXT         NOT NULL,
  "password"    TEXT         NOT NULL,
  "fullName"    TEXT         NOT NULL,
  "phone"       TEXT         NOT NULL,
  "city"        TEXT         NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "gender"      TEXT,
  "expiresAt"   TIMESTAMP(3) NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");