import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {Form, useActionData, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {RunStatusBadge} from "../components/RunStatusBadge";
import {authenticate} from "../shopify.server";
import {checkGrantedScopes} from "../modules/shopify/scopes.server";
import {graphqlRequest} from "../modules/shopify/adminClient.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  return checkGrantedScopes(admin);
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  try {
    const data = await graphqlRequest<{
      shop: {name: string; myshopifyDomain: string};
    }>(
      admin,
      `#graphql
        query TestConnection {
          shop {
            name
            myshopifyDomain
          }
        }
      `,
    );

    return {ok: true, message: `Connected to ${data.shop.name}`};
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="surface-stack">
      <TitleBar title="Settings" />
      <div className="surface-stack">
        {!data.hasReadAllOrders ? (
          <s-banner tone="warning">
            read_all_orders is not granted. 90-day and 1-year sorting may be incomplete until enough webhook history is collected.
          </s-banner>
        ) : null}

        <s-section heading="Granted scopes">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.scopes.map((scope) => (
                <tr key={scope.handle}>
                  <td>{scope.handle}</td>
                  <td>
                    {scope.granted ? (
                      <s-badge tone="success">Granted</s-badge>
                    ) : (
                      <s-badge tone="critical">Missing</s-badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </s-section>

        <s-section heading="API connection">
          <div className="surface-stack">
            {actionData ? (
              <s-banner tone={actionData.ok ? "success" : "critical"}>
                {actionData.message}
              </s-banner>
            ) : null}
            <Form method="post">
              <button type="submit">Test API connection</button>
            </Form>
          </div>
        </s-section>
      </div>
    </main>
  );
}
