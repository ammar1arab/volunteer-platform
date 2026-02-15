-- CreateEnum
CREATE TYPE "FeaturedPostCategory" AS ENUM ('HEALTH', 'EDUCATION', 'TECHNOLOGY', 'ENVIRONMENT', 'ENTREPRENEURSHIP', 'SELF_DEVELOPMENT', 'ARTS', 'SPORTS', 'ENTERTAINMENT', 'DISABILITY', 'ECONOMY', 'LAW');

-- AlterTable
ALTER TABLE "featured_posts" ADD COLUMN     "categories" "FeaturedPostCategory"[] DEFAULT ARRAY[]::"FeaturedPostCategory"[];
