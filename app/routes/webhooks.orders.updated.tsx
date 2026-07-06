import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {handleOrdersUpdatedWebhook} from "../modules/webhooks/ordersUpdated.server";

export const action = async ({request}: ActionFunctionArgs) => {
  const {shop, payload} = await authenticate.webhook(request);
  await handleOrdersUpdatedWebhook(shop, payload);

  return new Response(null, {status: 200});
};
