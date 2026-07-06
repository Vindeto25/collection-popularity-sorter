import type {LinksFunction, LoaderFunctionArgs} from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

import stylesheet from "./styles/app.css?url";

export const links: LinksFunction = () => [
  {rel: "stylesheet", href: stylesheet},
  {rel: "preconnect", href: "https://cdn.shopify.com"},
];

export const loader = async (_args: LoaderFunctionArgs) => null;

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.status === 200
      ? "Shopify redirected the embedded app before this page could load. Reopen the app from Shopify admin."
      : `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <html lang="en">
      <head>
        <title>Collection Popularity Sorter</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main style={{padding: 24}}>
          <h1>Collection Popularity Sorter</h1>
          <p>{message}</p>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
