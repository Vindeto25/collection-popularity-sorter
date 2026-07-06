import {AppButtonLink} from "./AppNavigation";

export function EmptyStateCard({
  heading,
  children,
  actionHref,
  actionLabel,
}: {
  heading: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <s-section>
      <div className="surface-stack">
        <s-heading>{heading}</s-heading>
        <s-paragraph>{children}</s-paragraph>
        {actionHref && actionLabel ? (
          <div>
            <AppButtonLink to={actionHref}>{actionLabel}</AppButtonLink>
          </div>
        ) : null}
      </div>
    </s-section>
  );
}
