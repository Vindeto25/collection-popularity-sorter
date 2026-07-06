import type {SortRule} from "@prisma/client";

import {getNextRunAt} from "../sorting/periods.server";
import type {SortSchedule} from "../sorting/sortingTypes";
import {
  createRule,
  deleteRule,
  getRuleById,
  updateRule,
} from "./rules.repository.server";
import {parseRuleFormData} from "./rules.validation";

function nextRunForSchedule(schedule: SortSchedule) {
  return getNextRunAt(schedule);
}

export async function requireRule(shopDomain: string, ruleId: string) {
  const rule = await getRuleById(shopDomain, ruleId);
  if (!rule) {
    throw new Response("Rule not found.", {status: 404});
  }

  return rule;
}

export async function createRuleFromForm(shopDomain: string, formData: FormData) {
  const values = parseRuleFormData(formData);

  return createRule({
    shopDomain,
    collectionId: values.collectionId,
    collectionHandle: values.collectionHandle || null,
    collectionTitle: values.collectionTitle,
    periodType: values.periodType,
    customStartDate: values.customStartDate,
    customEndDate: values.customEndDate,
    metric: values.metric,
    schedule: values.schedule,
    enabled: values.enabled,
    zeroSalesBehavior: values.zeroSalesBehavior,
    lastRunAt: null,
    nextRunAt: values.enabled ? nextRunForSchedule(values.schedule) : null,
  });
}

export async function updateRuleFromForm(
  shopDomain: string,
  ruleId: string,
  formData: FormData,
) {
  const values = parseRuleFormData(formData);

  return updateRule(shopDomain, ruleId, {
    collectionId: values.collectionId,
    collectionHandle: values.collectionHandle || null,
    collectionTitle: values.collectionTitle,
    periodType: values.periodType,
    customStartDate: values.customStartDate,
    customEndDate: values.customEndDate,
    metric: values.metric,
    schedule: values.schedule,
    enabled: values.enabled,
    zeroSalesBehavior: values.zeroSalesBehavior,
    nextRunAt: values.enabled ? nextRunForSchedule(values.schedule) : null,
  });
}

export async function disableRule(shopDomain: string, ruleId: string) {
  return updateRule(shopDomain, ruleId, {
    enabled: false,
    nextRunAt: null,
  });
}

export async function enableRule(shopDomain: string, rule: SortRule) {
  return updateRule(shopDomain, rule.id, {
    enabled: true,
    nextRunAt: nextRunForSchedule(rule.schedule),
  });
}

export async function removeRule(shopDomain: string, ruleId: string) {
  await deleteRule(shopDomain, ruleId);
}
