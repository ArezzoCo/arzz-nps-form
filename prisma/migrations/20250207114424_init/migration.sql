/*
  Warnings:

  - Added the required column `customerMetafieldKey` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerMetafieldNamespace` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderMetafieldKey` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderMetafieldNamespace` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "customerMetafieldKey" TEXT NOT NULL,
ADD COLUMN     "customerMetafieldNamespace" TEXT NOT NULL,
ADD COLUMN     "orderMetafieldKey" TEXT NOT NULL,
ADD COLUMN     "orderMetafieldNamespace" TEXT NOT NULL;
