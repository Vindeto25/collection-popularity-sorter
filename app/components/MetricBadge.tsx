export function MetricBadge({metric}: {metric: string}) {
  const label = metric === "QUANTITY_SOLD" ? "Quantity sold" : metric;

  return <s-badge tone="info">{label}</s-badge>;
}
