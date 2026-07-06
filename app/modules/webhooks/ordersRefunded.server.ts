export async function handleOrdersRefundedWebhook() {
  // TODO: Map refunds/create payloads back to affected order line items and
  // adjust ProductSalesDaily without double counting. Until that is implemented,
  // order update/cancel webhooks remain the source of aggregate corrections.
}
