import {describe, expect, it} from "vitest";

import {
  applyMovesForTest,
  calculateMoves,
  normalizeTargetOrder,
} from "./calculateMoves.server";

describe("calculateMoves", () => {
  it("returns no moves for empty, single, or identical lists", () => {
    expect(calculateMoves([], [])).toEqual([]);
    expect(calculateMoves(["p1"], ["p1"])).toEqual([]);
    expect(calculateMoves(["p1", "p2"], ["p1", "p2"])).toEqual([]);
  });

  it("calculates sequential moves that produce the target order", () => {
    const current = ["p1", "p2", "p3", "p4"];
    const target = ["p3", "p1", "p4", "p2"];
    const moves = calculateMoves(current, target);

    expect(applyMovesForTest(current, moves)).toEqual(target);
    expect(moves).toEqual([
      {id: "p3", newPosition: 0},
      {id: "p4", newPosition: 2},
    ]);
  });

  it("preserves current products missing from target at the end", () => {
    const normalized = normalizeTargetOrder(["p1", "p2", "p3"], ["p2"]);

    expect(normalized).toEqual(["p2", "p1", "p3"]);
    expect(applyMovesForTest(["p1", "p2", "p3"], calculateMoves(["p1", "p2", "p3"], ["p2"]))).toEqual(normalized);
  });

  it("ignores duplicate and malformed IDs defensively", () => {
    const moves = calculateMoves(["p1", "", "p1", "p2"], ["p2", "p2", ""]);

    expect(applyMovesForTest(["p1", "", "p1", "p2"], moves)).toEqual([
      "p2",
      "p1",
    ]);
  });
});
