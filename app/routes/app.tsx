import type {HeadersFunction, LoaderFunctionArgs} from "react-router";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useRouteError,
  useSearchParams,
} from "react-router";
import {NavMenu} from "@shopify/app-bridge-react";
import {AppProvider} from "@shopify/shopify-app-react-router/react";
import {boundary} from "@shopify/shopify-app-react-router/server";
import {useEffect} from "react";

import {authenticate} from "../shopify.server";
import {upsertShop} from "../modules/shopify/adminClient.server";
import {
  getReusableEmbeddedSearch,
  withEmbeddedQueryParams,
} from "../modules/shopify/embeddedNavigation";

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
  const location = useLocation();
  const embeddedSearch = getReusableEmbeddedSearch(location.search);

  return (
    <AppProvider embedded apiKey={apiKey}>
      <NavMenu>
        <Link to={withEmbeddedQueryParams("/app", embeddedSearch)} rel="home">
          Dashboard
        </Link>
        <Link to={withEmbeddedQueryParams("/app/rules", embeddedSearch)}>
          Sort rules
        </Link>
        <Link to={withEmbeddedQueryParams("/app/runs", embeddedSearch)}>
          Run history
        </Link>
        <Link to={withEmbeddedQueryParams("/app/settings", embeddedSearch)}>
          Settings
        </Link>
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
