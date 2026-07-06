import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {redirect, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {RuleForm} from "../components/RuleForm";
import {authenticate} from "../shopify.server";
import {listCollections} from "../modules/shopify/collections.server";
import {
  requireRule,
  updateRuleFromForm,
} from "../modules/rules/rules.service.server";
import {runCollectionSort} from "../modules/sorting/runCollectionSort.server";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const ruleId = params.ruleId ?? "";
  const [rule, collections] = await Promise.all([
    requireRule(session.shop, ruleId),
    listCollections(admin),
  ]);

  return {rule, collections};
};

export const action = async ({request, params}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const ruleId = params.ruleId ?? "";
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");

  try {
    const rule = await updateRuleFromForm(session.shop, ruleId, formData);

    if (intent === "preview") {
      return redirect(`/app/rules/${rule.id}/preview`);
    }

    if (intent === "saveAndRun") {
      await runCollectionSort({admin, shopDomain: session.shop, rule});
      return redirect("/app/runs?success=Rule saved and sorting run completed");
    }

    return redirect("/app/rules?success=Rule saved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rule could not be saved";
    return redirect(`/app/rules/${ruleId}?error=${encodeURIComponent(message)}`);
  }
};

export default function EditRulePage() {
  const {rule, collections} = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Edit sorting rule" />
      <div className="surface-stack">
        <s-section heading="Edit sorting rule">
          <s-paragraph>{rule.collectionTitle}</s-paragraph>
        </s-section>
        <RuleForm collections={collections} rule={rule} />
      </div>
    </main>
  );
}
