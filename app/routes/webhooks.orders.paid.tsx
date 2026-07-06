import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {handleOrderWebhook} from "../modules/webhooks/ordersPaid.server";

export const action = async ({request}: ActionFunctionArgs) => {
  const {shop, payload} = await authenticate.webhook(request);
  await handleOrderWebhook(shop, payload);

  return new Response(null, {status: 200});
};
