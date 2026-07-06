import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {redirect, useLoaderData} from "react-router";
import {TitleBar} from "@shopify/app-bridge-react";

import {RuleForm} from "../components/RuleForm";
import {authenticate} from "../shopify.server";
import {listCollections} from "../modules/shopify/collections.server";
import {createRuleFromForm} from "../modules/rules/rules.service.server";
import {withEmbeddedQueryParams} from "../modules/shopify/embeddedNavigation";
import {runCollectionSort} from "../modules/sorting/runCollectionSort.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  try {
    const collections = await listCollections(admin);

    return {collections, loadError: null};
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Collections could not be loaded.";
    console.error("Failed to load collections for rule form", error);

    return {collections: [], loadError: message};
  }
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, session} = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");
  const currentSearch = new URL(request.url).search;

  try {
    const rule = await createRuleFromForm(session.shop, formData);

    if (intent === "preview") {
      return redirect(
        withEmbeddedQueryParams(`/app/rules/${rule.id}/preview`, currentSearch),
      );
    }

    if (intent === "saveAndRun") {
      await runCollectionSort({admin, shopDomain: session.shop, rule});
      return redirect(
        withEmbeddedQueryParams("/app/runs", currentSearch, {
          success: "Rule saved and sorting run completed",
        }),
      );
    }

    return redirect(
      withEmbeddedQueryParams("/app/rules", currentSearch, {
        success: "Rule saved",
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rule could not be saved";
    return redirect(
      withEmbeddedQueryParams("/app/rules/new", currentSearch, {error: message}),
    );
  }
};

export default function NewRulePage() {
  const {collections, loadError} = useLoaderData<typeof loader>();

  return (
    <main className="surface-stack">
      <TitleBar title="Create sorting rule" />
      <div className="surface-stack">
        {loadError ? (
          <s-banner tone="critical">
            Collections could not be loaded: {loadError}
          </s-banner>
        ) : null}
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
