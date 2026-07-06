import type {AnchorHTMLAttributes, MouseEvent} from "react";
import {useLocation} from "react-router";

import {
  getReusableEmbeddedSearch,
  withEmbeddedQueryParams,
} from "../modules/shopify/embeddedNavigation";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

type AppButtonLinkProps = AppLinkProps;

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AppLink({to, ...props}: AppLinkProps) {
  const location = useLocation();
  const embeddedSearch = getReusableEmbeddedSearch(location.search);

  return <a {...props} href={withEmbeddedQueryParams(to, embeddedSearch)} />;
}

export function AppButtonLink({to, className, ...props}: AppButtonLinkProps) {
  const location = useLocation();
  const embeddedSearch = getReusableEmbeddedSearch(location.search);
  const href = withEmbeddedQueryParams(to, embeddedSearch);

  function forceDocumentNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a
      {...props}
      className={classNames("button-link", className)}
      href={href}
      onClick={forceDocumentNavigation}
    />
  );
}
