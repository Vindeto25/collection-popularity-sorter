import {useMemo, useState} from "react";
import type {FormEvent} from "react";
import {Form} from "react-router";
import type {SortRule} from "@prisma/client";

import type {ShopifyCollection} from "../modules/shopify/collections.server";
import {SCHEDULE_LABELS} from "../modules/sorting/periodLabels";
import type {PeriodType, SortSchedule} from "../modules/sorting/sortingTypes";
import {PeriodPicker} from "./PeriodPicker";

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
}

export function RuleForm({
  collections,
  rule,
}: {
  collections: ShopifyCollection[];
  rule?: SortRule | null;
}) {
  const initialCollectionId = rule?.collectionId ?? collections[0]?.id ?? "";
  const [collectionId, setCollectionId] = useState(initialCollectionId);
  const [periodType, setPeriodType] = useState<PeriodType>(
    (rule?.periodType as PeriodType | undefined) ?? "THIRTY_DAYS",
  );
  const cannotSubmit = collections.length === 0;

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === collectionId),
    [collections, collectionId],
  );

  function confirmImmediateRun(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (
      submitter instanceof HTMLButtonElement &&
      submitter.value === "saveAndRun" &&
      !window.confirm(
        "This will save the rule and change the manual order of this Shopify collection.",
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <Form method="post" className="surface-stack" onSubmit={confirmImmediateRun}>
      <input
        type="hidden"
        name="collectionTitle"
        value={selectedCollection?.title ?? rule?.collectionTitle ?? ""}
      />
      <input
        type="hidden"
        name="collectionHandle"
        value={selectedCollection?.handle ?? rule?.collectionHandle ?? ""}
      />
      <input
        type="hidden"
        name="zeroSalesBehavior"
        value="KEEP_RELATIVE_ORDER_AFTER_SOLD"
      />
      <input type="hidden" name="enabled" value={String(rule?.enabled ?? true)} />

      <s-section heading="Collection">
        <div className="field">
          <label htmlFor="collectionId">Collection</label>
          <select
            id="collectionId"
            name="collectionId"
            value={collectionId}
            onChange={(event) => setCollectionId(event.currentTarget.value)}
            required
          >
            <option value="" disabled>
              Choose a collection
            </option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
          </select>
        </div>
      </s-section>

      <s-section heading="Sorting">
        <div className="field-grid">
          <PeriodPicker value={periodType} onChange={setPeriodType} />

          <div className="field">
            <label htmlFor="metric">Metric</label>
            <select id="metric" name="metric" defaultValue={rule?.metric ?? "QUANTITY_SOLD"}>
              <option value="QUANTITY_SOLD">Quantity sold</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="schedule">Schedule</label>
            <select
              id="schedule"
              name="schedule"
              defaultValue={(rule?.schedule as SortSchedule | undefined) ?? "MANUAL"}
            >
              {Object.entries(SCHEDULE_LABELS).map(([schedule, label]) => (
                <option key={schedule} value={schedule}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodType === "CUSTOM" ? (
          <div className="field-grid" style={{marginTop: 14}}>
            <div className="field">
              <label htmlFor="customStartDate">Start date</label>
              <input
                id="customStartDate"
                name="customStartDate"
                type="date"
                defaultValue={toDateInputValue(rule?.customStartDate)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="customEndDate">End date</label>
              <input
                id="customEndDate"
                name="customEndDate"
                type="date"
                defaultValue={toDateInputValue(rule?.customEndDate)}
                required
              />
            </div>
          </div>
        ) : null}
      </s-section>

      <s-section heading="Zero-sales products">
        <s-paragraph>
          Products with no sales stay after sold products in their current relative order.
        </s-paragraph>
      </s-section>

      <div className="button-row">
        <button type="submit" name="intent" value="preview">
          Preview ranking
        </button>
        <button type="submit" name="intent" value="save" disabled={cannotSubmit}>
          Save rule
        </button>
        <button
          type="submit"
          name="intent"
          value="saveAndRun"
          disabled={cannotSubmit}
        >
          Save and run now
        </button>
      </div>
    </Form>
  );
}
