import {listDueRules} from "../rules/rules.repository.server";
import {runCollectionSort} from "../sorting/runCollectionSort.server";
import type {RunDueRulesOptions} from "./jobTypes";

export async function runDueRules({getAdminForShop, now}: RunDueRulesOptions) {
  const dueRules = await listDueRules(now);
  const results: Array<{ruleId: string; ok: boolean; error?: string}> = [];

  for (const rule of dueRules) {
    try {
      const admin = await getAdminForShop(rule.shopDomain);
      await runCollectionSort({
        admin,
        shopDomain: rule.shopDomain,
        rule,
      });
      results.push({ruleId: rule.id, ok: true});
    } catch (error) {
      results.push({
        ruleId: rule.id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
