import type {Prisma} from "@prisma/client";

import prisma from "../../db.server";

export type SortRuleCreateData = Omit<
  Prisma.SortRuleUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "runs"
>;

export type SortRuleUpdateData = Omit<
  Prisma.SortRuleUncheckedUpdateInput,
  "id" | "shopDomain" | "createdAt" | "updatedAt" | "runs"
>;

export async function listRules(shopDomain: string) {
  return prisma.sortRule.findMany({
    where: {shopDomain},
    orderBy: [{enabled: "desc"}, {updatedAt: "desc"}],
  });
}

export async function getRuleById(shopDomain: string, ruleId: string) {
  return prisma.sortRule.findFirst({
    where: {id: ruleId, shopDomain},
  });
}

export async function createRule(data: SortRuleCreateData) {
  return prisma.sortRule.create({data});
}

export async function updateRule(
  shopDomain: string,
  ruleId: string,
  data: SortRuleUpdateData,
) {
  return prisma.sortRule.update({
    where: {id: ruleId, shopDomain},
    data,
  });
}

export async function deleteRule(shopDomain: string, ruleId: string) {
  return prisma.sortRule.delete({
    where: {id: ruleId, shopDomain},
  });
}

export async function countActiveRules(shopDomain: string) {
  return prisma.sortRule.count({
    where: {shopDomain, enabled: true},
  });
}

export async function countManagedCollections(shopDomain: string) {
  const groups = await prisma.sortRule.groupBy({
    by: ["collectionId"],
    where: {shopDomain, enabled: true},
  });

  return groups.length;
}

export async function updateRuleAfterRun(
  shopDomain: string,
  ruleId: string,
  data: Pick<Prisma.SortRuleUncheckedUpdateInput, "lastRunAt" | "nextRunAt">,
) {
  return prisma.sortRule.update({
    where: {id: ruleId, shopDomain},
    data,
  });
}

export async function listDueRules(now = new Date()) {
  return prisma.sortRule.findMany({
    where: {
      enabled: true,
      schedule: {not: "MANUAL"},
      nextRunAt: {lte: now},
    },
    orderBy: {nextRunAt: "asc"},
  });
}
