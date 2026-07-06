import type {LoaderFunctionArgs} from "react-router";

import {authenticate} from "../shopify.server";
import {requireRule} from "../modules/rules/rules.service.server";
import {buildSortPreview} from "../modules/sorting/runCollectionSort.server";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const rule = await requireRule(session.shop, params.ruleId ?? "");
  const preview = await buildSortPreview(admin, rule);

  return Response.json({preview});
};
