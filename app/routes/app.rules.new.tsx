import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {redirect, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {RuleForm} from "../components/RuleForm";
import {authenticate} from "../shopify.server";
import {listCollections} from "../modules/shopify/collections.server";
import {createRuleFromForm} from "../modules/rules/rules.service.server";
import {runCollectionSort} from "../modules/sorting/runCollectionSort.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const collections = await listCollections(admin);

  return {collections};
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");

  try {
    const rule = await createRuleFromForm(session.shop, formData);

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
    return redirect(`/app/rules/new?error=${encodeURIComponent(message)}`);
  }
};

export default function NewRulePage() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Create sorting rule" />
      <div className="surface-stack">
        <s-section heading="Create sorting rule">
          <s-paragraph>
            Choose a collection, sales period, and schedule.
          </s-paragraph>
        </s-section>
        <RuleForm collections={collections} />
      </div>
    </main>
  );
}
