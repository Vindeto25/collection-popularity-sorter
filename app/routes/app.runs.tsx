import {format} from "date-fns";
import type {LoaderFunctionArgs} from "react-router";
import {useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {RunStatusBadge} from "../components/RunStatusBadge";
import {authenticate} from "../shopify.server";
import {listRuns} from "../modules/runs/runs.repository.server";
import {PERIOD_LABELS} from "../modules/sorting/periodLabels";
import type {PeriodType} from "../modules/sorting/sortingTypes";

function formatDate(date: Date | string | null | undefined) {
  return date ? format(new Date(date), "MMM d, yyyy h:mm a") : "-";
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  const runs = await listRuns(session.shop);

  return {runs};
};

export default function RunsPage() {
  const {runs} = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Run history" />
      <div className="surface-stack">
        <s-section heading="Run history">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Rule</th>
                <th>Collection</th>
                <th>Period</th>
                <th>Products analyzed</th>
                <th>Products moved</th>
                <th>Started at</th>
                <th>Completed at</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>
                    <RunStatusBadge status={run.status} />
                  </td>
                  <td>{run.rule?.id ?? "Deleted rule"}</td>
                  <td>{run.rule?.collectionTitle ?? run.collectionId}</td>
                  <td>{run.rule ? PERIOD_LABELS[run.rule.periodType as PeriodType] : "-"}</td>
                  <td>{run.productsAnalyzed}</td>
                  <td>{run.productsMoved}</td>
                  <td>{formatDate(run.startedAt)}</td>
                  <td>{formatDate(run.completedAt)}</td>
                  <td>{run.errorMessage ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </s-section>
      </div>
    </main>
  );
}
