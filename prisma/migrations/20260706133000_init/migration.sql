-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('SEVEN_DAYS', 'THIRTY_DAYS', 'NINETY_DAYS', 'ONE_YEAR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SortMetric" AS ENUM ('QUANTITY_SOLD');

-- CreateEnum
CREATE TYPE "SortSchedule" AS ENUM ('MANUAL', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "ZeroSalesBehavior" AS ENUM ('KEEP_RELATIVE_ORDER_AFTER_SOLD');

-- CreateEnum
CREATE TYPE "SortRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SortRule" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "collectionHandle" TEXT,
    "collectionTitle" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "customStartDate" TIMESTAMP(3),
    "customEndDate" TIMESTAMP(3),
    "metric" "SortMetric" NOT NULL DEFAULT 'QUANTITY_SOLD',
    "schedule" "SortSchedule" NOT NULL DEFAULT 'MANUAL',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "zeroSalesBehavior" "ZeroSalesBehavior" NOT NULL DEFAULT 'KEEP_RELATIVE_ORDER_AFTER_SOLD',
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SortRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SortRun" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "ruleId" TEXT,
    "collectionId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "SortRunStatus" NOT NULL DEFAULT 'PENDING',
    "productsAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "productsMoved" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SortRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSalesDaily" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL DEFAULT '',
    "quantitySold" INTEGER NOT NULL DEFAULT 0,
    "grossSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSalesDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedOrder" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "financialStatus" TEXT,
    "rawLineItemsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");

-- CreateIndex
CREATE INDEX "SortRule_shopDomain_idx" ON "SortRule"("shopDomain");

-- CreateIndex
CREATE INDEX "SortRule_shopDomain_enabled_nextRunAt_idx" ON "SortRule"("shopDomain", "enabled", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "SortRule_shopDomain_collectionId_key" ON "SortRule"("shopDomain", "collectionId");

-- CreateIndex
CREATE INDEX "SortRun_shopDomain_createdAt_idx" ON "SortRun"("shopDomain", "createdAt");

-- CreateIndex
CREATE INDEX "SortRun_ruleId_idx" ON "SortRun"("ruleId");

-- CreateIndex
CREATE INDEX "ProductSalesDaily_shopDomain_productId_date_idx" ON "ProductSalesDaily"("shopDomain", "productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSalesDaily_shopDomain_date_productId_variantId_key" ON "ProductSalesDaily"("shopDomain", "date", "productId", "variantId");

-- CreateIndex
CREATE INDEX "SyncedOrder_shopDomain_processedAt_idx" ON "SyncedOrder"("shopDomain", "processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedOrder_shopDomain_orderId_key" ON "SyncedOrder"("shopDomain", "orderId");

-- AddForeignKey
ALTER TABLE "SortRun" ADD CONSTRAINT "SortRun_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "SortRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
