import {AppProvider} from "@shopify/shopify-app-react-router/react";
import {useState} from "react";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {Form, useActionData, useLoaderData} from "react-router";

import {login} from "../../shopify.server";
import {loginErrorMessage} from "./error.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return {errors, apiKey: process.env.SHOPIFY_API_KEY ?? ""};
};

export const action = async ({request}: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return {errors};
};

export default function AuthLogin() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const errors = actionData?.errors ?? loaderData.errors;

  return (
    <AppProvider embedded={false}>
      <main className="surface-stack">
        <s-section heading="Log in">
          <Form method="post" className="surface-stack">
            <div className="field">
              <label htmlFor="shop">Shop domain</label>
              <input
                id="shop"
                name="shop"
                type="text"
                value={shop}
                onChange={(event) => setShop(event.currentTarget.value)}
                autoComplete="on"
                placeholder="example.myshopify.com"
              />
              {errors.shop ? <small>{errors.shop}</small> : null}
            </div>
            <button type="submit">Log in</button>
          </Form>
        </s-section>
      </main>
    </AppProvider>
  );
}
