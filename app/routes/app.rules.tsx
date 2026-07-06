import {format} from "date-fns";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {Form, Outlet, redirect, useLoaderData, useLocation} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {AppButtonLink, AppLink} from "../components/AppNavigation";
import {MetricBadge} from "../components/MetricBadge";
import {RunStatusBadge} from "../components/RunStatusBadge";
import {authenticate} from "../shopify.server";
import {EmptyStateCard} from "../components/EmptyStateCard";
import {listRules} from "../modules/rules/rules.repository.server";
import {withEmbeddedQueryParams} from "../modules/shopify/embeddedNavigation";
import {
  disableRule,
  enableRule,
  removeRule,
  requireRule,
} from "../modules/rules/rules.service.server";
import {runCollectionSort} from "../modules/sorting/runCollectionSort.server";
import {PERIOD_LABELS, SCHEDULE_LABELS} from "../modules/sorting/periodLabels";
import type {PeriodType, SortSchedule} from "../modules/sorting/sortingTypes";

function formatDate(date: Date | string | null | undefined) {
  return date ? format(new Date(date), "MMM d, yyyy h:mm a") : "-";
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const rules = await listRules(session.shop);

  return {rules};
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const formData = await request.formData();
  const ruleId = String(formData.get("ruleId") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const currentSearch = new URL(request.url).search;

  if (!ruleId) {
    return redirect(
      withEmbeddedQueryParams("/app/rules", currentSearch, {
        error: "Missing rule",
      }),
    );
  }

  try {
    const rule = await requireRule(session.shop, ruleId);

    if (intent === "runNow") {
      await runCollectionSort({admin, shopDomain: session.shop, rule});
      return redirect(
        withEmbeddedQueryParams("/app/runs", currentSearch, {
          success: "Sorting run completed",
        }),
      );
    }

    if (intent === "disable") {
      await disableRule(session.shop, ruleId);
      return redirect(
        withEmbeddedQueryParams("/app/rules", currentSearch, {
          success: "Rule disabled",
        }),
      );
    }

    if (intent === "enable") {
      await enableRule(session.shop, rule);
      return redirect(
        withEmbeddedQueryParams("/app/rules", currentSearch, {
          success: "Rule enabled",
        }),
      );
    }

    if (intent === "delete") {
      await removeRule(session.shop, ruleId);
      return redirect(
        withEmbeddedQueryParams("/app/rules", currentSearch, {
          success: "Rule deleted",
        }),
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return redirect(
      withEmbeddedQueryParams("/app/rules", currentSearch, {error: message}),
    );
  }

  return redirect(withEmbeddedQueryParams("/app/rules", currentSearch));
};

export default function RulesPage() {
  const {rules} = useLoaderData<typeof loader>();
  const location = useLocation();
  const isRulesIndex = location.pathname.replace(/\/$/, "") === "/app/rules";

  if (!isRulesIndex) {
    return <Outlet />;
  }

  return (
    <main className="surface-stack">
      <TitleBar title="Sort rules" />
      <div className="surface-stack">
        <s-section heading="Sort rules">
          <div className="button-row">
            <AppButtonLink to="/app/rules/new">Create sorting rule</AppButtonLink>
          </div>
        </s-section>

        {rules.length === 0 ? (
          <EmptyStateCard
            heading="No sorting rules yet"
            actionHref="/app/rules/new"
            actionLabel="Create sorting rule"
          >
            Choose a collection and a sales window to create the first rule.
          </EmptyStateCard>
        ) : (
          <s-section>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Period</th>
                  <th>Metric</th>
                  <th>Status</th>
                  <th>Last run</th>
                  <th>Next run</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.collectionTitle}</td>
                    <td>{PERIOD_LABELS[rule.periodType as PeriodType]}</td>
                    <td>
                      <MetricBadge metric={rule.metric} />
                    </td>
                    <td>
                      {rule.enabled ? (
                        <s-badge tone="success">Enabled</s-badge>
                      ) : (
                        <s-badge tone="warning">Disabled</s-badge>
                      )}
                    </td>
                    <td>{formatDate(rule.lastRunAt)}</td>
                    <td>
                      {rule.schedule === "MANUAL"
                        ? SCHEDULE_LABELS[rule.schedule as SortSchedule]
                        : formatDate(rule.nextRunAt)}
                    </td>
                    <td>
                      <div className="table-actions">
                        <AppLink to={`/app/rules/${rule.id}`}>Edit</AppLink>
                        <AppLink to={`/app/rules/${rule.id}/preview`}>
                          Preview
                        </AppLink>
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
                          <input type="hidden" name="ruleId" value={rule.id} />
                          <button type="submit" name="intent" value="runNow">
                            Run now
                          </button>
                        </Form>
                        <Form method="post">
                          <input type="hidden" name="ruleId" value={rule.id} />
                          <button
                            type="submit"
                            name="intent"
                            value={rule.enabled ? "disable" : "enable"}
                          >
                            {rule.enabled ? "Disable" : "Enable"}
                          </button>
                        </Form>
                        <Form method="post">
                          <input type="hidden" name="ruleId" value={rule.id} />
                          <button
                            className="danger-button"
                            type="submit"
                            name="intent"
                            value="delete"
                          >
                            Delete
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-section>
        )}
      </div>
    </main>
  );
}
