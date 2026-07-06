import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {graphqlRequest} from "../modules/shopify/adminClient.server";

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
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

  return Response.json({ok: true, shop: data.shop});
};
