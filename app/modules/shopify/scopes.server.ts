import type {AdminGraphqlClient} from "./adminClient.server";
import {graphqlRequest} from "./adminClient.server";

export const REQUIRED_SCOPES = [
  "read_products",
  "write_products",
  "read_orders",
  "read_all_orders",
] as const;

export type ScopeStatus = {
  handle: string;
  granted: boolean;
};

export async function checkGrantedScopes(admin: AdminGraphqlClient) {
  const data = await graphqlRequest<{
    currentAppInstallation: {
      accessScopes: Array<{handle: string}>;
    };
  }>(
    admin,
    `#graphql
      query CurrentAppScopes {
        currentAppInstallation {
          accessScopes {
            handle
          }
        }
      }
    `,
  );

  const granted = new Set(
    data.currentAppInstallation.accessScopes.map((scope) => scope.handle),
  );

  const scopes: ScopeStatus[] = REQUIRED_SCOPES.map((handle) => ({
    handle,
    granted: granted.has(handle),
  }));

  return {
    scopes,
    hasReadAllOrders: granted.has("read_all_orders"),
    missingRequiredScopes: scopes
      .filter((scope) => !scope.granted)
      .map((scope) => scope.handle),
  };
}
