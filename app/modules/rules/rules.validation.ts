import {z} from "zod";

import {
  PERIOD_TYPES,
  SORT_METRICS,
  SORT_SCHEDULES,
  ZERO_SALES_BEHAVIORS,
} from "../sorting/sortingTypes";

export const ruleFormSchema = z
  .object({
    collectionId: z.string().min(1, "Choose a collection."),
    collectionHandle: z.string().optional().nullable(),
    collectionTitle: z.string().min(1, "Choose a collection."),
    periodType: z.enum(PERIOD_TYPES),
    customStartDate: z.string().optional().nullable(),
    customEndDate: z.string().optional().nullable(),
    metric: z.enum(SORT_METRICS).default("QUANTITY_SOLD"),
    schedule: z.enum(SORT_SCHEDULES).default("MANUAL"),
    enabled: z.boolean().default(true),
    zeroSalesBehavior: z
      .enum(ZERO_SALES_BEHAVIORS)
      .default("KEEP_RELATIVE_ORDER_AFTER_SOLD"),
  })
  .superRefine((value, context) => {
    if (value.periodType !== "CUSTOM") {
      return;
    }

    if (!value.customStartDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customStartDate"],
        message: "Choose a custom start date.",
      });
    }

    if (!value.customEndDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customEndDate"],
        message: "Choose a custom end date.",
      });
    }

    if (value.customStartDate && value.customEndDate) {
      const start = new Date(value.customStartDate);
      const end = new Date(value.customEndDate);
      if (start > end) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customStartDate"],
          message: "Start date must be before end date.",
        });
      }
    }
  });

export type RuleFormInput = z.infer<typeof ruleFormSchema>;

function valueFromFormData(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function parseRuleFormData(formData: FormData) {
  const parsed = ruleFormSchema.parse({
    collectionId: valueFromFormData(formData, "collectionId"),
    collectionHandle: valueFromFormData(formData, "collectionHandle"),
    collectionTitle: valueFromFormData(formData, "collectionTitle"),
    periodType: valueFromFormData(formData, "periodType"),
    customStartDate: valueFromFormData(formData, "customStartDate") || null,
    customEndDate: valueFromFormData(formData, "customEndDate") || null,
    metric: valueFromFormData(formData, "metric") || "QUANTITY_SOLD",
    schedule: valueFromFormData(formData, "schedule") || "MANUAL",
    enabled: formData.get("enabled") !== "false",
    zeroSalesBehavior:
      valueFromFormData(formData, "zeroSalesBehavior") ||
      "KEEP_RELATIVE_ORDER_AFTER_SOLD",
  });

  return {
    ...parsed,
    customStartDate:
      parsed.periodType === "CUSTOM" && parsed.customStartDate
        ? new Date(parsed.customStartDate)
        : null,
    customEndDate:
      parsed.periodType === "CUSTOM" && parsed.customEndDate
        ? new Date(parsed.customEndDate)
        : null,
  };
}
