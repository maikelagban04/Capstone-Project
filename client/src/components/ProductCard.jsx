import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <article className="card product-card">
      <img src={product.image} alt={product.title} className="product-card__image" />
      <div className="product-card__body">
        <span className="pill">{product.componentType}</span>
        <h3>{product.title}</h3>
        <p className="product-brand-model">
          <strong>{product.brand}</strong> {product.model}
        </p>
        <p className="product-description">{product.description}</p>

        {/* Mostra specifiche chiave */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <dl className="product-specs">
            {product.specifications.cores && (
              <>
                <dt>Cores:</dt>
                <dd>{product.specifications.cores}</dd>
              </>
            )}
            {product.specifications.memory && (
              <>
                <dt>Memory:</dt>
                <dd>{product.specifications.memory}</dd>
              </>
            )}
            {product.specifications.capacity && (
              <>
                <dt>Capacity:</dt>
                <dd>{product.specifications.capacity}</dd>
              </>
            )}
            {product.specifications.frequency && (
              <>
                <dt>Frequency:</dt>
                <dd>{product.specifications.frequency}</dd>
              </>
            )}
          </dl>
        )}

        <div className="price-row">
          <div>
            <strong>EUR {product.finalPrice.toFixed(2)}</strong>
            <small>
              Base EUR {product.priceBase.toFixed(2)} + {product.markup}% markup
            </small>
          </div>
          <div className="button-row">
            <Link to={`/products/${product._id}`} className="button button--ghost">
              Details
            </Link>
            <button
              type="button"
              className="button"
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
