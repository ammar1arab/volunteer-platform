-- CreateTable
CREATE TABLE "featured_posts" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "featured_posts_title_idx" ON "featured_posts"("title");
