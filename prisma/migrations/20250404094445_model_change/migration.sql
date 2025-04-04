/*
  Warnings:

  - You are about to drop the column `name` on the `metaData` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `metaData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format` to the `metaData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `metaData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `metaData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "metaData" DROP COLUMN "name",
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "format" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
