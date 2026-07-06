import {Link} from "react-router";

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
            <Link to={actionHref}>{actionLabel}</Link>
          </div>
        ) : null}
      </div>
    </s-section>
  );
}
