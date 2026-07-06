import type {RunDueRulesOptions} from "./jobTypes";
import {runDueRules} from "./runDueRules.server";

export async function runSchedulerTick(options: RunDueRulesOptions) {
  return runDueRules(options);
}
