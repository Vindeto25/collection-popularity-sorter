import type {AdminGraphqlClient} from "./adminClient.server";
import {graphqlRequest, userErrorsToMessage} from "./adminClient.server";
import type {CollectionProduct} from "../sorting/sortingTypes";

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  sortOrder?: string;
};

type CollectionsResponse = {
  collections: {
    nodes: ShopifyCollection[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

export async function listCollections(
  admin: AdminGraphqlClient,
  query?: string,
) {
  const collections: ShopifyCollection[] = [];
  let after: string | null = null;

  do {
    const data: CollectionsResponse = await graphqlRequest<CollectionsResponse>(
      admin,
      `#graphql
        query ListCollections($after: String, $query: String) {
          collections(first: 50, after: $after, query: $query) {
            nodes {
              id
              title
              handle
              sortOrder
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {after, query: query || null},
    );

    collections.push(...data.collections.nodes);
    after = data.collections.pageInfo.hasNextPage
      ? data.collections.pageInfo.endCursor
      : null;
  } while (after);

  return collections;
}

type CollectionProductsResponse = {
  collection: {
    id: string;
    title: string;
    handle: string;
    sortOrder: string;
    products: {
      nodes: Array<{
        id: string;
        title: string;
        handle: string;
        featuredImage?: {
          url: string;
          altText: string | null;
        } | null;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
};

export async function getCollectionProducts(
  admin: AdminGraphqlClient,
  collectionId: string,
) {
  const products: CollectionProduct[] = [];
  let after: string | null = null;
  let collection: CollectionProductsResponse["collection"] = null;

  do {
    const data: CollectionProductsResponse =
      await graphqlRequest<CollectionProductsResponse>(
      admin,
      `#graphql
        query GetCollectionProducts($id: ID!, $after: String) {
          collection(id: $id) {
            id
            title
            handle
            sortOrder
            products(first: 250, after: $after) {
              nodes {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
        {id: collectionId, after},
      );

    collection = data.collection;
    if (!collection) {
      throw new Error("Collection not found.");
    }

    for (const product of collection.products.nodes) {
      products.push({
        id: product.id,
        title: product.title,
        handle: product.handle,
        imageUrl: product.featuredImage?.url ?? null,
        currentPosition: products.length,
      });
    }

    after = collection.products.pageInfo.hasNextPage
      ? collection.products.pageInfo.endCursor
      : null;
  } while (after);

  return {
    collection: {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      sortOrder: collection.sortOrder,
    },
    products,
  };
}

export async function updateCollectionSortOrderToManual(
  admin: AdminGraphqlClient,
  collectionId: string,
) {
  const data = await graphqlRequest<{
    collectionUpdate: {
      collection: {id: string; sortOrder: string} | null;
      userErrors: Array<{field?: string[] | null; message: string}>;
    };
  }>(
    admin,
    `#graphql
      mutation UpdateCollectionSortOrder($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            sortOrder
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {input: {id: collectionId, sortOrder: "MANUAL"}},
  );

  const userError = userErrorsToMessage(data.collectionUpdate.userErrors);
  if (userError) {
    throw new Error(userError);
  }

  return data.collectionUpdate.collection;
}
