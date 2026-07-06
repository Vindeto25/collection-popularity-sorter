import type {
  CollectionProduct,
  RankedProduct,
  SalesByProductId,
} from "./sortingTypes";

function sanitizeCurrentProducts(products: CollectionProduct[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (!product.id || seen.has(product.id)) {
      return false;
    }
    seen.add(product.id);
    return true;
  });
}

export function buildTargetOrder(
  currentProducts: CollectionProduct[],
  salesByProductId: SalesByProductId,
) {
  const products = sanitizeCurrentProducts(currentProducts).map((product, index) => {
    const sales = salesByProductId[product.id];
    return {
      ...product,
      currentPosition: product.currentPosition ?? index,
      quantitySold: sales?.quantitySold ?? 0,
      grossRevenue: sales?.grossRevenue ?? 0,
      orderCount: sales?.orderCount ?? 0,
    } satisfies Omit<RankedProduct, "newPosition">;
  });

  const soldProducts = products
    .filter((product) => product.quantitySold > 0)
    .sort((left, right) => {
      if (right.quantitySold !== left.quantitySold) {
        return right.quantitySold - left.quantitySold;
      }

      if (right.grossRevenue !== left.grossRevenue) {
        return right.grossRevenue - left.grossRevenue;
      }

      if (left.currentPosition !== right.currentPosition) {
        return left.currentPosition - right.currentPosition;
      }

      return left.title.localeCompare(right.title);
    });

  const zeroSaleProducts = products.filter(
    (product) => product.quantitySold <= 0,
  );

  return [...soldProducts, ...zeroSaleProducts].map((product, newPosition) => ({
    ...product,
    newPosition,
  }));
}
