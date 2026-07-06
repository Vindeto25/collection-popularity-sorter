import {subDays} from "date-fns";

import type {AdminGraphqlClient} from "./adminClient.server";
import {graphqlRequest} from "./adminClient.server";
import type {OrderForAggregation} from "../sorting/aggregateSales.server";

type OrdersResponse = {
  orders: {
    nodes: Array<{
      id: string;
      createdAt: string;
      cancelledAt: string | null;
      displayFinancialStatus: string | null;
      lineItems: {
        nodes: Array<{
          quantity: number;
          discountedTotalSet?: {
            shopMoney: {
              amount: string;
            };
          } | null;
          product?: {
            id: string;
            title: string;
          } | null;
          variant?: {
            id: string;
          } | null;
        }>;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

export type OrdersForPeriodResult = {
  orders: OrderForAggregation[];
  warning: string | null;
};

export function periodMayNeedReadAllOrders(startDate: Date, now = new Date()) {
  return startDate < subDays(now, 60);
}

function buildOrderSearchQuery(startDate: Date, endDate: Date) {
  return [
    `created_at:>=${startDate.toISOString()}`,
    `created_at:<=${endDate.toISOString()}`,
    "status:any",
  ].join(" ");
}

export async function getOrdersForPeriod(
  admin: AdminGraphqlClient,
  startDate: Date,
  endDate: Date,
  hasReadAllOrders: boolean,
): Promise<OrdersForPeriodResult> {
  const warning =
    periodMayNeedReadAllOrders(startDate) && !hasReadAllOrders
      ? "This period may include orders older than Shopify's default order access window. Results can be incomplete without read_all_orders or stored webhook history."
      : null;

  const orders: OrderForAggregation[] = [];
  let after: string | null = null;

  do {
    const data: OrdersResponse = await graphqlRequest<OrdersResponse>(
      admin,
      `#graphql
        query OrdersForPeriod($after: String, $query: String!) {
          orders(first: 100, after: $after, query: $query, sortKey: CREATED_AT) {
            nodes {
              id
              createdAt
              cancelledAt
              displayFinancialStatus
              lineItems(first: 250) {
                nodes {
                  quantity
                  discountedTotalSet {
                    shopMoney {
                      amount
                    }
                  }
                  product {
                    id
                    title
                  }
                  variant {
                    id
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {after, query: buildOrderSearchQuery(startDate, endDate)},
    );

    for (const order of data.orders.nodes) {
      orders.push({
        id: order.id,
        createdAt: new Date(order.createdAt),
        cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : null,
        financialStatus: order.displayFinancialStatus ?? null,
        lineItems: order.lineItems.nodes.map((lineItem) => ({
          productId: lineItem.product?.id ?? null,
          productTitle: lineItem.product?.title ?? null,
          variantId: lineItem.variant?.id ?? null,
          quantity: lineItem.quantity,
          grossRevenue: Number(
            lineItem.discountedTotalSet?.shopMoney.amount ?? 0,
          ),
        })),
      });
    }

    after = data.orders.pageInfo.hasNextPage
      ? data.orders.pageInfo.endCursor
      : null;
  } while (after);

  return {orders, warning};
}
