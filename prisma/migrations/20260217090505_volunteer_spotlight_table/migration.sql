-- CreateTable
CREATE TABLE "VolunteerSpotlight" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "spotlightDate" TIMESTAMP(3) NOT NULL,
    "city" "JordanianCity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerSpotlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolunteerSpotlight_name_idx" ON "VolunteerSpotlight"("name");
