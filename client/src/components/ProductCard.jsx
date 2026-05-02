import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CartIcon } from "./icons";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const finalPrice = Number(product.finalPrice || 0);
  const basePrice = Number(product.priceBase || 0);
  const hasDiscount = basePrice > 0 && basePrice > finalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img src={product.image} alt={product.title} loading="lazy" decoding="async" />
        <span className="product-card__tag">{product.componentType}</span>
      </Link>

      <div className="product-card__body">
        <p className="product-card__category">{product.componentType}</p>
        <h3>
          <Link to={`/products/${product._id}`}>{product.title}</Link>
        </h3>

        <div className="price-row-display">
          {hasDiscount ? (
            <span className="price-old">€ {basePrice.toFixed(2)}</span>
          ) : null}
          <span className="price-new">€ {finalPrice.toFixed(2)}</span>
          {hasDiscount ? (
            <span className="price-discount">-{discountPercent}%</span>
          ) : null}
        </div>

        <button
          type="button"
          className="product-card__cta"
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
        >
          <CartIcon />
          <span>{product.inStock ? "Aggiungi al carrello" : "Non disponibile"}</span>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
