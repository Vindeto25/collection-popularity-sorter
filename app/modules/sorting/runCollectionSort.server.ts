import type {SortRule} from "@prisma/client";

import type {AdminGraphqlClient} from "../shopify/adminClient.server";
import {getCollectionProducts} from "../shopify/collections.server";
import {getOrdersForPeriod} from "../shopify/orders.server";
import {reorderCollectionProducts} from "../shopify/reorderCollection.server";
import {checkGrantedScopes} from "../shopify/scopes.server";
import {createSortRun, markRunFailed, markRunRunning, markRunSuccess} from "../runs/runs.repository.server";
import {updateRuleAfterRun} from "../rules/rules.repository.server";
import {aggregateSalesFromOrders} from "./aggregateSales.server";
import {buildTargetOrder} from "./buildTargetOrder.server";
import {calculateMoves} from "./calculateMoves.server";
import {getNextRunAt, getPeriodRange} from "./periods.server";
import type {PeriodType, SortPreview} from "./sortingTypes";

type SortRuleLike = Pick<
  SortRule,
  | "id"
  | "collectionId"
  | "periodType"
  | "customStartDate"
  | "customEndDate"
  | "schedule"
>;

export async function buildSortPreview(
  admin: AdminGraphqlClient,
  rule: SortRuleLike,
  options: {hasReadAllOrders?: boolean} = {},
): Promise<SortPreview> {
  const {startDate, endDate} = getPeriodRange(
    rule.periodType as PeriodType,
    rule.customStartDate,
    rule.customEndDate,
  );

  const scopes =
    typeof options.hasReadAllOrders === "boolean"
      ? {hasReadAllOrders: options.hasReadAllOrders}
      : await checkGrantedScopes(admin);

  const [{products}, ordersResult] = await Promise.all([
    getCollectionProducts(admin, rule.collectionId),
    getOrdersForPeriod(admin, startDate, endDate, scopes.hasReadAllOrders),
  ]);

  const salesByProductId = aggregateSalesFromOrders(ordersResult.orders);
  const rankedProducts = buildTargetOrder(products, salesByProductId);
  const targetProductIds = rankedProducts.map((product) => product.id);
  const moves = calculateMoves(
    products.map((product) => product.id),
    targetProductIds,
  );

  return {
    products: rankedProducts,
    targetProductIds,
    moves,
    productsMoved: moves.length,
    productsAnalyzed: products.length,
    warning: ordersResult.warning,
    periodStart: startDate,
    periodEnd: endDate,
  };
}

export async function runCollectionSort({
  admin,
  shopDomain,
  rule,
}: {
  admin: AdminGraphqlClient;
  shopDomain: string;
  rule: SortRule;
}) {
  const {startDate, endDate} = getPeriodRange(
    rule.periodType as PeriodType,
    rule.customStartDate,
    rule.customEndDate,
  );

  const run = await createSortRun({
    shopDomain,
    ruleId: rule.id,
    collectionId: rule.collectionId,
    periodStart: startDate,
    periodEnd: endDate,
    status: "PENDING",
  });

  try {
    await markRunRunning(run.id);
    const preview = await buildSortPreview(admin, rule);

    if (preview.moves.length > 0) {
      await reorderCollectionProducts(admin, rule.collectionId, preview.moves);
    }

    await markRunSuccess(run.id, {
      productsAnalyzed: preview.productsAnalyzed,
      productsMoved: preview.productsMoved,
    });

    await updateRuleAfterRun(shopDomain, rule.id, {
      lastRunAt: new Date(),
      nextRunAt: getNextRunAt(rule.schedule),
    });

    return {
      runId: run.id,
      preview,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The sorting run failed.";
    await markRunFailed(run.id, message);
    throw error;
  }
}
