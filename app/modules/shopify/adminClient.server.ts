import prisma from "../../db.server";

export type AdminGraphqlClient = {
  graphql(
    query: string,
    options?: {
      variables?: Record<string, unknown>;
      tries?: number;
    },
  ): Promise<Response>;
};

type GraphQLJson<T> = {
  data?: T;
  errors?: Array<{message: string}>;
};

export async function graphqlRequest<T>(
  admin: AdminGraphqlClient,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await admin.graphql(query, {variables});
  const json = (await response.json()) as GraphQLJson<T>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  if (!json.data) {
    throw new Error("Shopify returned an empty GraphQL response.");
  }

  return json.data;
}

export function userErrorsToMessage(
  userErrors: Array<{field?: string[] | null; message: string}> | undefined,
) {
  if (!userErrors?.length) {
    return null;
  }

  return userErrors
    .map((error) =>
      error.field?.length
        ? `${error.field.join(".")}: ${error.message}`
        : error.message,
    )
    .join("; ");
}

export async function upsertShop(shopDomain: string) {
  return prisma.shop.upsert({
    where: {shopDomain},
    update: {},
    create: {shopDomain},
  });
}
