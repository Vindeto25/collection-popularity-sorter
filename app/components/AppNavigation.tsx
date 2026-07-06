import type {ComponentProps} from "react";
import {Link, useLocation, useNavigate} from "react-router";

import {withEmbeddedQueryParams} from "../modules/shopify/embeddedNavigation";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "to"> & {
  to: string;
};

type AppButtonLinkProps = Omit<ComponentProps<"button">, "onClick" | "type"> & {
  to: string;
};

export function AppLink({to, ...props}: AppLinkProps) {
  const location = useLocation();

  return <Link {...props} to={withEmbeddedQueryParams(to, location.search)} />;
}

export function AppButtonLink({to, ...props}: AppButtonLinkProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <button
      {...props}
      type="button"
      onClick={() => navigate(withEmbeddedQueryParams(to, location.search))}
    />
  );
}

