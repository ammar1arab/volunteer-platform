-- Clear legacy HIGH_SCHOOL then rebuild EducationLevel for Jordanian grades
UPDATE "volunteer_profiles"
SET "educationLevel" = NULL
WHERE "educationLevel"::text = 'HIGH_SCHOOL';

UPDATE "pending_registrations"
SET "educationLevel" = 'GRADE_12'
WHERE "educationLevel" = 'HIGH_SCHOOL';

ALTER TABLE "volunteer_profiles" ALTER COLUMN "educationLevel" DROP DEFAULT;
ALTER TABLE "volunteer_profiles" ALTER COLUMN "educationLevel" TYPE TEXT USING "educationLevel"::text;

DROP TYPE IF EXISTS "EducationLevel";

CREATE TYPE "EducationLevel" AS ENUM (
  'KINDERGARTEN',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12',
  'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'OTHER'
);

ALTER TABLE "volunteer_profiles"
  ALTER COLUMN "educationLevel" TYPE "EducationLevel"
  USING "educationLevel"::"EducationLevel";
