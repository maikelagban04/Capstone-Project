import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useAuth } from "../hooks/useAuth";
import { HeartIcon } from "../components/icons";
import {
  formatKeyLabel,
  getCompatibilityEntries,
  getProductMeta,
  getSpecificationEntries,
} from "../utils/productHelpers";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const inWishlist = wishlist?.isInWishlist?.(id) || false;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await wishlist?.toggleWishlist?.(id);
    } catch (err) {
      console.error("Wishlist toggle failed", err);
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/products/${id}`);
        setProduct(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <div className="empty-panel">Caricamento prodotto...</div>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!product) {
    return <div className="empty-panel">Prodotto non trovato.</div>;
  }

  const specificationEntries = getSpecificationEntries(product);
  const compatibilityEntries = getCompatibilityEntries(product);
  const finalPrice = Number(product.finalPrice || 0);
  const salePrice = Number(product.salePrice || 0);
  const isOnSale = Boolean(product.isOnSale) && salePrice > 0 && salePrice < finalPrice;
  const displayPrice = isOnSale ? salePrice : finalPrice;
  const outOfStock = !product.inStock;

  return (
    <div className="page-stack">
      <section className={`product-layout ${outOfStock ? "is-out-of-stock" : ""}`}>
        <div className="product-view">
          <img src={product.image} alt={product.title} className="product-view__image" />
          {outOfStock ? <span className="product-view__overlay">OUT OF STOCK</span> : null}
          {isOnSale ? <span className="product-view__sale">In sconto</span> : null}
        </div>

        <aside className="product-summary">
          <span className="section-kicker">{product.componentType}</span>
          <h1>{product.title}</h1>
          <p className="product-summary__meta">{getProductMeta(product)}</p>
          <p className="product-summary__description">{product.description}</p>

          <div className="product-summary__stats">
            <div>
              <small>{isOnSale ? "Prezzo scontato" : "Prezzo finale"}</small>
              <strong>€ {displayPrice.toFixed(2)}</strong>
            </div>
            <div>
              <small>{isOnSale ? "Prezzo originale" : "Prezzo base"}</small>
              <strong>€ {(isOnSale ? finalPrice : product.priceBase).toFixed(2)}</strong>
            </div>
            <div>
              <small>Markup</small>
              <strong>{product.markup}%</strong>
            </div>
            <div>
              <small>Stock</small>
              <strong>{product.stock}</strong>
            </div>
          </div>

          <div className="product-summary__cta">
            <span className={`stock-pill ${product.inStock ? "is-available" : "is-empty"}`}>
              {product.inStock ? "Disponibile" : "Esaurito"}
            </span>
            <button
              type="button"
              className="btn btn-primary btn-shell btn-shell--primary"
              onClick={() => addToCart({ ...product, finalPrice: displayPrice })}
              disabled={outOfStock}
            >
              {outOfStock ? "Non disponibile" : "Aggiungi al carrello"}
            </button>
            <button
              type="button"
              className={`btn-shell btn-shell--ghost product-summary__wishlist ${inWishlist ? "is-active" : ""}`}
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? "Rimuovi dalla wishlist" : "Aggiungi alla wishlist"}
              title={inWishlist ? "Rimuovi dalla wishlist" : "Aggiungi alla wishlist"}
            >
              <HeartIcon filled={inWishlist} />
              <span>{inWishlist ? "Salvato" : "Wishlist"}</span>
            </button>
          </div>
        </aside>
      </section>

      <section className="detail-grid">
        <article className="detail-panel">
          <div className="section-head">
            <div>
              <span className="section-kicker">Specifiche</span>
              <h2>Dettagli tecnici</h2>
            </div>
          </div>
          {specificationEntries.length > 0 ? (
            <dl className="detail-list">
              {specificationEntries.map(([key, value]) => (
                <div key={key}>
                  <dt>{formatKeyLabel(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="empty-copy">Nessuna specifica tecnica aggiuntiva.</p>
          )}
        </article>

        <article className="detail-panel">
          <div className="section-head">
            <div>
              <span className="section-kicker">Compatibilità</span>
              <h2>Informazioni build</h2>
            </div>
          </div>
          {compatibilityEntries.length > 0 ? (
            <dl className="detail-list">
              {compatibilityEntries.map(([key, value]) => (
                <div key={key}>
                  <dt>{formatKeyLabel(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="empty-copy">Nessuna informazione di compatibilità disponibile.</p>
          )}
        </article>
      </section>
    </div>
  );
};

export default ProductDetailPage;
