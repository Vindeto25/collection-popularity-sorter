import type {LoaderFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {listCollections} from "../modules/shopify/collections.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const collections = await listCollections(admin, query);

  return Response.json({collections});
};
