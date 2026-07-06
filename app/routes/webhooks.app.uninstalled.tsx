import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {handleAppUninstalled} from "../modules/webhooks/appUninstalled.server";

export const action = async ({request}: ActionFunctionArgs) => {
  const {shop} = await authenticate.webhook(request);
  await handleAppUninstalled(shop);

  return new Response(null, {status: 200});
};
