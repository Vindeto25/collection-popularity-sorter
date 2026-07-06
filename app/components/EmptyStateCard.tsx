import {useNavigate} from "react-router";

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
  const navigate = useNavigate();

  return (
    <s-section>
      <div className="surface-stack">
        <s-heading>{heading}</s-heading>
        <s-paragraph>{children}</s-paragraph>
        {actionHref && actionLabel ? (
          <div>
            <button type="button" onClick={() => navigate(actionHref)}>
              {actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </s-section>
  );
}
