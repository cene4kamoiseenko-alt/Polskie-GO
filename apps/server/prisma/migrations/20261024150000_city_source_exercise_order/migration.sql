-- DropIndex
DROP INDEX "exercises_lesson_id_order_idx";

-- AlterTable
ALTER TABLE "user_cities" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'journey';

-- CreateIndex
CREATE UNIQUE INDEX "exercises_lesson_id_order_key" ON "exercises"("lesson_id", "order");

