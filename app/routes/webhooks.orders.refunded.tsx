import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {handleOrdersRefundedWebhook} from "../modules/webhooks/ordersRefunded.server";

export const action = async ({request}: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  await handleOrdersRefundedWebhook();

  return new Response(null, {status: 200});
};
