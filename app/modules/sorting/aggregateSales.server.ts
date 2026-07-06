import type {SalesAggregate, SalesByProductId} from "./sortingTypes";

export type OrderLineItemForAggregation = {
  productId: string | null;
  productTitle?: string | null;
  variantId?: string | null;
  quantity: number;
  grossRevenue?: number;
};

export type OrderForAggregation = {
  id: string;
  createdAt: Date;
  cancelledAt?: Date | null;
  financialStatus?: string | null;
  lineItems: OrderLineItemForAggregation[];
};

function shouldCountOrder(order: OrderForAggregation) {
  if (order.cancelledAt) {
    return false;
  }

  const status = order.financialStatus?.toUpperCase();
  if (!status) {
    return true;
  }

  return ["PAID", "PARTIALLY_PAID", "PARTIALLY_REFUNDED"].includes(status);
}

export function aggregateSalesFromOrders(
  orders: OrderForAggregation[],
): SalesByProductId {
  const salesByProductId: SalesByProductId = {};

  for (const order of orders) {
    if (!shouldCountOrder(order)) {
      continue;
    }

    const productsSeenInOrder = new Set<string>();

    for (const lineItem of order.lineItems) {
      if (!lineItem.productId || lineItem.quantity <= 0) {
        continue;
      }

      const existing: SalesAggregate = salesByProductId[lineItem.productId] ?? {
        productId: lineItem.productId,
        productTitle: lineItem.productTitle ?? null,
        quantitySold: 0,
        grossRevenue: 0,
        orderCount: 0,
      };

      existing.quantitySold += lineItem.quantity;
      existing.grossRevenue += lineItem.grossRevenue ?? 0;
      if (!productsSeenInOrder.has(lineItem.productId)) {
        existing.orderCount += 1;
        productsSeenInOrder.add(lineItem.productId);
      }

      salesByProductId[lineItem.productId] = existing;
    }
  }

  return salesByProductId;
}
