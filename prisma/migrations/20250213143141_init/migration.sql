-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "customerMetafieldKey" DROP NOT NULL,
ALTER COLUMN "customerMetafieldNamespace" DROP NOT NULL,
ALTER COLUMN "orderMetafieldKey" DROP NOT NULL,
ALTER COLUMN "orderMetafieldNamespace" DROP NOT NULL;
