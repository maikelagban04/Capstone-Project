import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CartIcon } from "./icons";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const finalPrice = Number(product.finalPrice || 0);
  const basePrice = Number(product.priceBase || 0);
  const salePrice = Number(product.salePrice || 0);
  const isOnSale = Boolean(product.isOnSale) && salePrice > 0 && salePrice < finalPrice;
  const outOfStock = !product.inStock;

  const displayPrice = isOnSale ? salePrice : finalPrice;
  const oldPrice = isOnSale ? finalPrice : basePrice > finalPrice ? basePrice : 0;
  const discountPercent = isOnSale
    ? Math.round(((finalPrice - salePrice) / finalPrice) * 100)
    : oldPrice > 0
      ? Math.round(((oldPrice - finalPrice) / oldPrice) * 100)
      : 0;

  const cardClass = [
    "product-card",
    outOfStock ? "is-out-of-stock" : "",
    isOnSale ? "is-on-sale" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img src={product.image} alt={product.title} loading="lazy" decoding="async" />
        <span className="product-card__tag">{product.componentType}</span>
        {isOnSale ? <span className="product-card__sale-badge">In sconto</span> : null}
        {outOfStock ? <span className="product-card__overlay">OUT OF STOCK</span> : null}
      </Link>

      <div className="product-card__body">
        <p className="product-card__category">{product.componentType}</p>
        <h3>
          <Link to={`/products/${product._id}`}>{product.title}</Link>
        </h3>

        <div className="price-row-display">
          {oldPrice > 0 ? <span className="price-old">€ {oldPrice.toFixed(2)}</span> : null}
          <span className="price-new">€ {displayPrice.toFixed(2)}</span>
          {discountPercent > 0 ? (
            <span className="price-discount">-{discountPercent}%</span>
          ) : null}
        </div>

        <button
          type="button"
          className="product-card__cta"
          onClick={() => addToCart({ ...product, finalPrice: displayPrice })}
          disabled={outOfStock}
        >
          <CartIcon />
          <span>{outOfStock ? "Non disponibile" : "Aggiungi al carrello"}</span>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
