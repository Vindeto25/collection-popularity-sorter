import type {HeadersFunction, LoaderFunctionArgs} from "react-router";
import {
  Link,
  Outlet,
  useLoaderData,
  useRouteError,
  useSearchParams,
} from "react-router";
import {NavMenu} from "@shopify/app-bridge-react";
import {AppProvider} from "@shopify/shopify-app-react-router/react";
import {boundary} from "@shopify/shopify-app-react-router/server";
import {useEffect} from "react";

import {authenticate} from "../shopify.server";
import {upsertShop} from "../modules/shopify/adminClient.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {session} = await authenticate.admin(request);
  if (session?.shop) {
    await upsertShop(session.shop);
  }

  return {
    apiKey: process.env.SHOPIFY_API_KEY ?? "",
  };
};

function ToastFromSearchParams() {
  const [params] = useSearchParams();

  useEffect(() => {
    const success = params.get("success");
    const error = params.get("error");
    if (success) {
      window.shopify?.toast?.show(success);
    }
    if (error) {
      window.shopify?.toast?.show(error, {isError: true});
    }
  }, [params]);

  return null;
}

export default function AppLayout() {
  const {apiKey} = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Dashboard
        </Link>
        <Link to="/app/rules">Sort rules</Link>
        <Link to="/app/runs">Run history</Link>
        <Link to="/app/settings">Settings</Link>
      </NavMenu>
      <ToastFromSearchParams />
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
