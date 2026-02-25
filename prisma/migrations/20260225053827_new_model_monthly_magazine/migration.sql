-- CreateTable
CREATE TABLE "monthly_magazines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "monthYear" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_magazines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_magazines_monthYear_idx" ON "monthly_magazines"("monthYear");
