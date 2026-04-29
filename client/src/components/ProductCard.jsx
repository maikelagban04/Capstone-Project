import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { getProductMeta } from "../utils/productHelpers";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img src={product.image} alt={product.title} loading="lazy" decoding="async" />
        <span className="product-card__tag">{product.componentType}</span>
      </Link>

      <div className="product-card__body">
        <p className="product-card__meta">{getProductMeta(product)}</p>
        <h3>{product.title}</h3>
        <p className="product-card__description">{product.description}</p>

        <div className="product-card__footer">
          <div>
            <small>Prezzo finale</small>
            <strong>€ {product.finalPrice.toFixed(2)}</strong>
          </div>
          <span className={`stock-pill ${product.inStock ? "is-available" : "is-empty"}`}>
            {product.inStock ? "Disponibile" : "Esaurito"}
          </span>
        </div>

        <div className="product-card__actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline-secondary btn-shell">
            Dettagli
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-shell btn-shell--primary"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
          >
            Aggiungi
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
