import {describe, expect, it} from "vitest";

import {buildTargetOrder} from "./buildTargetOrder.server";

describe("buildTargetOrder", () => {
  const products = [
    {id: "p1", title: "Blue Dress", currentPosition: 0},
    {id: "p2", title: "Green Dress", currentPosition: 1},
    {id: "p3", title: "Red Dress", currentPosition: 2},
    {id: "p4", title: "White Dress", currentPosition: 3},
  ];

  it("places sold products first and preserves zero-sale relative order", () => {
    const result = buildTargetOrder(products, {
      p3: {productId: "p3", quantitySold: 8, grossRevenue: 80, orderCount: 3},
      p1: {productId: "p1", quantitySold: 2, grossRevenue: 40, orderCount: 1},
    });

    expect(result.map((product) => product.id)).toEqual(["p3", "p1", "p2", "p4"]);
  });

  it("uses revenue and current order as tie-breakers", () => {
    const result = buildTargetOrder(products, {
      p1: {productId: "p1", quantitySold: 4, grossRevenue: 20, orderCount: 1},
      p2: {productId: "p2", quantitySold: 4, grossRevenue: 40, orderCount: 1},
      p3: {productId: "p3", quantitySold: 4, grossRevenue: 20, orderCount: 1},
    });

    expect(result.map((product) => product.id)).toEqual(["p2", "p1", "p3", "p4"]);
  });
});
