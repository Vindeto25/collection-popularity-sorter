import {
  addDays,
  addWeeks,
  endOfDay,
  format,
  startOfDay,
  subDays,
  subYears,
} from "date-fns";

import type {PeriodType, SortSchedule} from "./sortingTypes";
export {PERIOD_LABELS, SCHEDULE_LABELS} from "./periodLabels";

export type PeriodRange = {
  startDate: Date;
  endDate: Date;
};

export function getPeriodRange(
  periodType: PeriodType,
  customStartDate?: Date | string | null,
  customEndDate?: Date | string | null,
  now = new Date(),
): PeriodRange {
  const endDate = endOfDay(now);

  switch (periodType) {
    case "SEVEN_DAYS":
      return {startDate: startOfDay(subDays(now, 6)), endDate};
    case "THIRTY_DAYS":
      return {startDate: startOfDay(subDays(now, 29)), endDate};
    case "NINETY_DAYS":
      return {startDate: startOfDay(subDays(now, 89)), endDate};
    case "ONE_YEAR":
      return {startDate: startOfDay(subYears(now, 1)), endDate};
    case "CUSTOM": {
      if (!customStartDate || !customEndDate) {
        throw new Error("Custom date ranges need both a start date and an end date.");
      }

      const start = startOfDay(new Date(customStartDate));
      const customEnd = endOfDay(new Date(customEndDate));

      if (Number.isNaN(start.getTime()) || Number.isNaN(customEnd.getTime())) {
        throw new Error("Custom date range is invalid.");
      }

      if (start > customEnd) {
        throw new Error("Start date must be before end date.");
      }

      return {startDate: start, endDate: customEnd};
    }
    default:
      periodType satisfies never;
      throw new Error("Unsupported period type.");
  }
}

export function getNextRunAt(schedule: SortSchedule, from = new Date()) {
  if (schedule === "DAILY") {
    return addDays(from, 1);
  }

  if (schedule === "WEEKLY") {
    return addWeeks(from, 1);
  }

  return null;
}

export function formatPeriodRange(range: PeriodRange) {
  return `${format(range.startDate, "MMM d, yyyy")} - ${format(
    range.endDate,
    "MMM d, yyyy",
  )}`;
}
