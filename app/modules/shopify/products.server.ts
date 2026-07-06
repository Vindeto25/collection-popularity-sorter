export function isProductGid(value: string | null | undefined) {
  return typeof value === "string" && value.startsWith("gid://shopify/Product/");
}

export function productAdminUrl(productGid: string) {
  const productId = productGid.split("/").at(-1);
  return productId ? `shopify://admin/products/${productId}` : null;
}
