import {format} from "date-fns";
import type {LoaderFunctionArgs} from "react-router";
import {Link, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {authenticate} from "../shopify.server";
import {
  countActiveRules,
  countManagedCollections,
} from "../modules/rules/rules.repository.server";
import {getLatestRunByStatus} from "../modules/runs/runs.repository.server";
import {checkGrantedScopes} from "../modules/shopify/scopes.server";

function formatDate(date: Date | string | null | undefined) {
  return date ? format(new Date(date), "MMM d, yyyy h:mm a") : "None yet";
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const shopDomain = session.shop;

  const [activeRules, managedCollections, lastSuccess, lastFailure, scopes] =
    await Promise.all([
      countActiveRules(shopDomain),
      countManagedCollections(shopDomain),
      getLatestRunByStatus(shopDomain, "SUCCESS"),
      getLatestRunByStatus(shopDomain, "FAILED"),
      checkGrantedScopes(admin),
    ]);

  return {
    activeRules,
    managedCollections,
    lastSuccess,
    lastFailure,
    hasReadAllOrders: scopes.hasReadAllOrders,
  };
};

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Collection Popularity Sorter" />
      <div className="surface-stack">
        {!data.hasReadAllOrders ? (
          <s-banner tone="warning">
            Long-range sorting can be incomplete until read_all_orders is approved or webhook history has built up.
          </s-banner>
        ) : null}

        <s-section heading="Collection Popularity Sorter">
          <div className="surface-stack">
            <s-paragraph>
              Sort Shopify collections by quantity sold in a selected period, then apply the ranking as manual collection order.
            </s-paragraph>
            <div>
              <Link to="/app/rules/new">Create sorting rule</Link>
            </div>
          </div>
        </s-section>

        <div className="stats-grid">
          <div className="metric-card">
            <s-text>Active sort rules</s-text>
            <p className="metric-card__value">{data.activeRules}</p>
          </div>
          <div className="metric-card">
            <s-text>Last successful run</s-text>
            <p className="metric-card__value">
              {formatDate(data.lastSuccess?.completedAt)}
            </p>
          </div>
          <div className="metric-card">
            <s-text>Last failed run</s-text>
            <p className="metric-card__value">
              {formatDate(data.lastFailure?.completedAt)}
            </p>
          </div>
          <div className="metric-card">
            <s-text>Collections managed</s-text>
            <p className="metric-card__value">{data.managedCollections}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
