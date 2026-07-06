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
            <form action={actionHref} method="get">
              <button type="submit">{actionLabel}</button>
            </form>
          </div>
        ) : null}
      </div>
    </s-section>
  );
}
