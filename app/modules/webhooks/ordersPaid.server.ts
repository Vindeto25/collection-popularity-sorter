import {startOfDay} from "date-fns";
import type {Prisma} from "@prisma/client";

import prisma from "../../db.server";

export type ShopifyOrderWebhookLineItem = {
  product_id?: number | string | null;
  variant_id?: number | string | null;
  quantity?: number | string | null;
  price?: number | string | null;
  final_price?: number | string | null;
  pre_tax_price?: number | string | null;
  title?: string | null;
};

export type ShopifyOrderWebhookPayload = {
  id?: number | string;
  admin_graphql_api_id?: string;
  processed_at?: string | null;
  created_at?: string | null;
  cancelled_at?: string | null;
  financial_status?: string | null;
  line_items?: ShopifyOrderWebhookLineItem[];
};

type StoredLineItem = {
  date: string;
  productId: string;
  variantId: string;
  quantitySold: number;
  grossSales: number;
  orderCount: number;
};

function toShopifyGid(kind: "Product" | "ProductVariant", value: unknown) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);
  return stringValue.startsWith("gid://")
    ? stringValue
    : `gid://shopify/${kind}/${stringValue}`;
}

function moneyValue(lineItem: ShopifyOrderWebhookLineItem) {
  const value =
    lineItem.final_price ?? lineItem.pre_tax_price ?? lineItem.price ?? 0;
  return Number(value) || 0;
}

function normalizeLineItems(payload: ShopifyOrderWebhookPayload) {
  const processedAt = payload.processed_at ?? payload.created_at;
  const date = startOfDay(processedAt ? new Date(processedAt) : new Date());
  const grouped = new Map<string, StoredLineItem>();

  for (const lineItem of payload.line_items ?? []) {
    const productId = toShopifyGid("Product", lineItem.product_id);
    if (!productId) {
      continue;
    }

    const variantId = toShopifyGid("ProductVariant", lineItem.variant_id);
    const quantitySold = Number(lineItem.quantity ?? 0);
    if (quantitySold <= 0) {
      continue;
    }

    const key = `${productId}:${variantId}`;
    const existing =
      grouped.get(key) ??
      ({
        date: date.toISOString(),
        productId,
        variantId,
        quantitySold: 0,
        grossSales: 0,
        orderCount: 1,
      } satisfies StoredLineItem);

    existing.quantitySold += quantitySold;
    existing.grossSales += moneyValue(lineItem) * quantitySold;
    grouped.set(key, existing);
  }

  return Array.from(grouped.values());
}

function rawLineItemsToStoredLineItems(value: Prisma.JsonValue) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is StoredLineItem => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false;
    }

    const maybeItem = item as Partial<StoredLineItem>;
    return (
      typeof maybeItem.date === "string" &&
      typeof maybeItem.productId === "string" &&
      typeof maybeItem.variantId === "string" &&
      typeof maybeItem.quantitySold === "number" &&
      typeof maybeItem.grossSales === "number" &&
      typeof maybeItem.orderCount === "number"
    );
  });
}

async function applyDailyAggregateDelta(
  tx: Prisma.TransactionClient,
  shopDomain: string,
  lineItems: StoredLineItem[],
  direction: 1 | -1,
) {
  for (const lineItem of lineItems) {
    await tx.productSalesDaily.upsert({
      where: {
        shopDomain_date_productId_variantId: {
          shopDomain,
          date: new Date(lineItem.date),
          productId: lineItem.productId,
          variantId: lineItem.variantId,
        },
      },
      create: {
        shopDomain,
        date: new Date(lineItem.date),
        productId: lineItem.productId,
        variantId: lineItem.variantId,
        quantitySold: lineItem.quantitySold * direction,
        grossSales: lineItem.grossSales * direction,
        orderCount: lineItem.orderCount * direction,
      },
      update: {
        quantitySold: {increment: lineItem.quantitySold * direction},
        grossSales: {increment: lineItem.grossSales * direction},
        orderCount: {increment: lineItem.orderCount * direction},
      },
    });
  }
}

export async function handleOrderWebhook(
  shopDomain: string,
  payload: ShopifyOrderWebhookPayload,
) {
  const orderId =
    payload.admin_graphql_api_id ??
    (payload.id ? `gid://shopify/Order/${payload.id}` : null);

  if (!orderId) {
    throw new Error("Order webhook did not include an order ID.");
  }

  const normalizedLineItems = normalizeLineItems(payload);
  const processedAt = payload.processed_at
    ? new Date(payload.processed_at)
    : payload.created_at
      ? new Date(payload.created_at)
      : new Date();
  const cancelledAt = payload.cancelled_at ? new Date(payload.cancelled_at) : null;

  await prisma.$transaction(async (tx) => {
    const previous = await tx.syncedOrder.findUnique({
      where: {shopDomain_orderId: {shopDomain, orderId}},
    });

    if (previous) {
      await applyDailyAggregateDelta(
        tx,
        shopDomain,
        rawLineItemsToStoredLineItems(previous.rawLineItemsJson),
        -1,
      );
    }

    const lineItemsToStore = cancelledAt ? [] : normalizedLineItems;
    await tx.syncedOrder.upsert({
      where: {shopDomain_orderId: {shopDomain, orderId}},
      create: {
        shopDomain,
        orderId,
        processedAt,
        cancelledAt,
        financialStatus: payload.financial_status ?? null,
        rawLineItemsJson: lineItemsToStore,
      },
      update: {
        processedAt,
        cancelledAt,
        financialStatus: payload.financial_status ?? null,
        rawLineItemsJson: lineItemsToStore,
      },
    });

    await applyDailyAggregateDelta(tx, shopDomain, lineItemsToStore, 1);
  });
}
