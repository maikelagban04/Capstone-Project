import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <article className="product-card card h-100">
      <div className="product-card__media">
        <img
          src={product.image}
          alt={product.title}
          className="product-card__image"
          loading="lazy"
          decoding="async"
        />
        <span className="product-chip">{product.componentType || product.category}</span>
      </div>

      <div className="product-card__body">
        <div className="product-card__header">
          <p className="product-card__meta">{product.brand} {product.model ? `· ${product.model}` : ""}</p>
          <h3>{product.title}</h3>
          <p className="product-card__description">{product.description}</p>
        </div>

        <div className="product-spec-strip">
          <span>{product.category}</span>
          <span>{product.inStock ? "Disponibile" : "Esaurito"}</span>
        </div>

        <div className="product-card__footer">
          <div>
            <small>Prezzo finale</small>
            <strong>€ {product.finalPrice.toFixed(2)}</strong>
          </div>
          <div>
            <small>Markup</small>
            <strong>{product.markup}%</strong>
          </div>
        </div>

        <div className="product-card__actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline-secondary btn-premium-outline">
            Dettagli
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-premium"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
          >
            {product.inStock ? "Aggiungi" : "Esaurito"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
