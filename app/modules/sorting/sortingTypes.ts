export const PERIOD_TYPES = [
  "SEVEN_DAYS",
  "THIRTY_DAYS",
  "NINETY_DAYS",
  "ONE_YEAR",
  "CUSTOM",
] as const;

export const SORT_METRICS = ["QUANTITY_SOLD"] as const;

export const SORT_SCHEDULES = ["MANUAL", "DAILY", "WEEKLY"] as const;

export const ZERO_SALES_BEHAVIORS = [
  "KEEP_RELATIVE_ORDER_AFTER_SOLD",
] as const;

export type PeriodType = (typeof PERIOD_TYPES)[number];
export type SortMetric = (typeof SORT_METRICS)[number];
export type SortSchedule = (typeof SORT_SCHEDULES)[number];
export type ZeroSalesBehavior = (typeof ZERO_SALES_BEHAVIORS)[number];

export type CollectionProduct = {
  id: string;
  title: string;
  handle?: string | null;
  imageUrl?: string | null;
  currentPosition: number;
};

export type SalesAggregate = {
  productId: string;
  productTitle?: string | null;
  quantitySold: number;
  grossRevenue: number;
  orderCount: number;
};

export type SalesByProductId = Record<string, SalesAggregate>;

export type RankedProduct = CollectionProduct & {
  newPosition: number;
  quantitySold: number;
  grossRevenue: number;
  orderCount: number;
};

export type MoveInput = {
  id: string;
  newPosition: string;
};

export type SortPreview = {
  products: RankedProduct[];
  targetProductIds: string[];
  moves: MoveInput[];
  productsMoved: number;
  productsAnalyzed: number;
  warning: string | null;
  periodStart: Date;
  periodEnd: Date;
};
