import type {ActionFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {requireRule} from "../modules/rules/rules.service.server";
import {runCollectionSort} from "../modules/sorting/runCollectionSort.server";

export const action = async ({request, params}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const rule = await requireRule(session.shop, params.ruleId ?? "");
  const result = await runCollectionSort({
    admin,
    shopDomain: session.shop,
    rule,
  });

  return Response.json({ok: true, result});
};
