import {describe, expect, it} from "vitest";
import {format} from "date-fns";

import {getPeriodRange} from "./periods.server";

describe("getPeriodRange", () => {
  const now = new Date("2026-07-06T10:00:00.000Z");

  it("calculates the last 7 days inclusively", () => {
    const range = getPeriodRange("SEVEN_DAYS", null, null, now);

    expect(format(range.startDate, "yyyy-MM-dd HH:mm:ss")).toBe(
      "2026-06-30 00:00:00",
    );
    expect(format(range.endDate, "yyyy-MM-dd HH:mm:ss")).toBe(
      "2026-07-06 23:59:59",
    );
  });

  it("validates custom date ranges", () => {
    expect(() =>
      getPeriodRange("CUSTOM", "2026-07-05", "2026-07-01", now),
    ).toThrow("Start date must be before end date.");
  });
});
