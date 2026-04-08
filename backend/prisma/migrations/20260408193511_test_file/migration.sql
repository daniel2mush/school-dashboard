/*
  Warnings:

  - Added the required column `test2` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "test2" BOOLEAN NOT NULL;
