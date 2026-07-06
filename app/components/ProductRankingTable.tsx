import type {RankedProduct} from "../modules/sorting/sortingTypes";

export function ProductRankingTable({products}: {products: RankedProduct[]}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Current position</th>
          <th>New position</th>
          <th>Quantity sold</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <div className="product-cell">
                {product.imageUrl ? (
                  <img
                    className="thumbnail"
                    src={product.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="thumbnail" aria-hidden="true" />
                )}
                <span>{product.title}</span>
              </div>
            </td>
            <td>{product.currentPosition + 1}</td>
            <td>{product.newPosition + 1}</td>
            <td>{product.quantitySold}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
