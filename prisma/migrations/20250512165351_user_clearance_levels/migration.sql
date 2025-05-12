/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aydoHandle]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aydoHandle` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "aydoHandle" TEXT NOT NULL,
ADD COLUMN     "clearanceLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "discordName" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "rsiAccountName" TEXT,
ALTER COLUMN "role" SET DEFAULT 'member';

-- CreateIndex
CREATE UNIQUE INDEX "User_aydoHandle_key" ON "User"("aydoHandle");
