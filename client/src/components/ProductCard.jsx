import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <article className="card product-card h-100 shadow-hover">
      <div className="position-relative overflow-hidden rounded-4">
        <img src={product.image} alt={product.title} className="card-img-top feature-img" loading="lazy" decoding="async" />
        <span className="badge badge-top">{product.componentType}</span>
      </div>
      <div className="card-body d-flex flex-column gap-3">
        <div>
          <h3 className="h6 mb-2">{product.title}</h3>
          <p className="text-secondary mb-2">{product.brand} · {product.model}</p>
          <p className="text-muted small truncate-3">{product.description}</p>
        </div>
        <div className="mt-auto">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <strong className="d-block">EUR {product.finalPrice.toFixed(2)}</strong>
              <small className="text-secondary">Base EUR {product.priceBase.toFixed(2)}</small>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to={`/products/${product._id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
              Details
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-primary flex-grow-1"
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              {product.inStock ? "Add" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
