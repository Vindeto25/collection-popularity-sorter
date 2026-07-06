import type {PeriodType, SortSchedule} from "./sortingTypes";

export const PERIOD_LABELS: Record<PeriodType, string> = {
  SEVEN_DAYS: "Last 7 days",
  THIRTY_DAYS: "Last 30 days",
  NINETY_DAYS: "Last 90 days",
  ONE_YEAR: "Last 1 year",
  CUSTOM: "Custom date range",
};

export const SCHEDULE_LABELS: Record<SortSchedule, string> = {
  MANUAL: "Manual only",
  DAILY: "Daily",
  WEEKLY: "Weekly",
};
