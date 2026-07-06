import {format} from "date-fns";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {Form, redirect, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {ProductRankingTable} from "../components/ProductRankingTable";
import {authenticate} from "../shopify.server";
import {requireRule} from "../modules/rules/rules.service.server";
import {withEmbeddedQueryParams} from "../modules/shopify/embeddedNavigation";
import {
  buildSortPreview,
  runCollectionSort,
} from "../modules/sorting/runCollectionSort.server";
import {PERIOD_LABELS} from "../modules/sorting/periodLabels";
import type {PeriodType} from "../modules/sorting/sortingTypes";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const rule = await requireRule(session.shop, params.ruleId ?? "");
  const preview = await buildSortPreview(admin, rule);

  return {rule, preview};
};

export const action = async ({request, params}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const rule = await requireRule(session.shop, params.ruleId ?? "");
  const currentSearch = new URL(request.url).search;

  try {
    await runCollectionSort({admin, shopDomain: session.shop, rule});
    return redirect(
      withEmbeddedQueryParams("/app/runs", currentSearch, {
        success: "Sort applied",
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sort could not be applied";
    return redirect(
      withEmbeddedQueryParams(`/app/rules/${rule.id}/preview`, currentSearch, {
        error: message,
      }),
    );
  }
};

export default function PreviewRulePage() {
  const {rule, preview} = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Preview ranking" />
      <div className="surface-stack">
        {preview.warning ? <s-banner tone="warning">{preview.warning}</s-banner> : null}
        <s-banner tone="warning">
          This will change the manual order of this Shopify collection.
        </s-banner>

        <s-section heading={rule.collectionTitle}>
          <s-paragraph>
            {PERIOD_LABELS[rule.periodType as PeriodType]} · {format(new Date(preview.periodStart), "MMM d, yyyy")} to {format(new Date(preview.periodEnd), "MMM d, yyyy")}
          </s-paragraph>
        </s-section>

        <s-section heading="Proposed ranking">
          <ProductRankingTable products={preview.products} />
        </s-section>

        <div className="button-row">
          <Form
            method="post"
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "This will change the manual order of this Shopify collection.",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              name="intent"
              value="apply"
              disabled={preview.moves.length === 0}
            >
              Apply sort
            </button>
          </Form>
          <s-text>
            {preview.moves.length === 0
              ? "No product positions need to change."
              : `${preview.moves.length} products will move.`}
          </s-text>
        </div>
      </div>
    </main>
  );
}
