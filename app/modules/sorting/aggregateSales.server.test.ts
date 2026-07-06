import {describe, expect, it} from "vitest";

import {aggregateSalesFromOrders} from "./aggregateSales.server";

describe("aggregateSalesFromOrders", () => {
  it("aggregates quantity, revenue, and unique order count by product", () => {
    const result = aggregateSalesFromOrders([
      {
        id: "order-1",
        createdAt: new Date("2026-07-01"),
        financialStatus: "PAID",
        lineItems: [
          {productId: "p1", quantity: 2, grossRevenue: 50},
          {productId: "p1", quantity: 1, grossRevenue: 25},
          {productId: "p2", quantity: 1, grossRevenue: 10},
        ],
      },
      {
        id: "order-2",
        createdAt: new Date("2026-07-02"),
        cancelledAt: new Date("2026-07-03"),
        financialStatus: "PAID",
        lineItems: [{productId: "p1", quantity: 10, grossRevenue: 100}],
      },
    ]);

    expect(result.p1).toMatchObject({
      quantitySold: 3,
      grossRevenue: 75,
      orderCount: 1,
    });
    expect(result.p2).toMatchObject({
      quantitySold: 1,
      grossRevenue: 10,
      orderCount: 1,
    });
  });
});
