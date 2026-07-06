import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {handleOrdersCancelledWebhook} from "../modules/webhooks/ordersCancelled.server";

export const action = async ({request}: ActionFunctionArgs) => {
  const {shop, payload} = await authenticate.webhook(request);
  await handleOrdersCancelledWebhook(shop, payload);

  return new Response(null, {status: 200});
};
