import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useAuth } from "../hooks/useAuth";
import { CheckIcon, HeartIcon } from "../components/icons";
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
  const [activeImage, setActiveImage] = useState("");

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
        setActiveImage("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Galleria immagini: l'immagine principale + tutte quelle in `images` (deduplicate).
  const gallery = useMemo(() => {
    if (!product) return [];
    const set = new Set();
    if (product.image) set.add(product.image);
    (product.images || []).forEach((url) => url && set.add(url));
    return Array.from(set);
  }, [product]);

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

  const currentImage = activeImage || product.image;

  // Meta tags extra: anno, garanzia, colore, peso. Filtrati a quelli valorizzati.
  const productExtras = [
    product.releaseYear ? { label: "Anno", value: product.releaseYear } : null,
    product.warrantyMonths ? { label: "Garanzia", value: `${product.warrantyMonths} mesi` } : null,
    product.color ? { label: "Colore", value: product.color } : null,
    product.weightGrams ? { label: "Peso", value: `${product.weightGrams} g` } : null,
  ].filter(Boolean);

  return (
    <div className="page-stack">
      <section className={`product-layout ${outOfStock ? "is-out-of-stock" : ""}`}>
        <div className="product-view">
          <img src={currentImage} alt={product.title} className="product-view__image" />
          {outOfStock ? <span className="product-view__overlay">OUT OF STOCK</span> : null}
          {isOnSale ? <span className="product-view__sale">In sconto</span> : null}
          {gallery.length > 1 ? (
            <div className="product-view__thumbs">
              {gallery.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`product-view__thumb ${src === currentImage ? "is-active" : ""}`}
                  onClick={() => setActiveImage(src)}
                  aria-label="Mostra immagine"
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="product-summary">
          <span className="section-kicker">{product.componentType}</span>
          <h1>{product.title}</h1>
          <p className="product-summary__meta">{getProductMeta(product)}</p>
          {product.shortDescription ? (
            <p className="product-summary__short">{product.shortDescription}</p>
          ) : null}
          <p className="product-summary__description">{product.description}</p>

          {Array.isArray(product.highlights) && product.highlights.length > 0 ? (
            <ul className="product-summary__highlights">
              {product.highlights.map((item, idx) => (
                <li key={idx}>
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

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

      {productExtras.length > 0 || product.dimensionsMm ? (
        <section className="detail-panel">
          <div className="section-head">
            <div>
              <span className="section-kicker">Info prodotto</span>
              <h2>Caratteristiche aggiuntive</h2>
            </div>
          </div>
          <dl className="detail-list">
            {productExtras.map((extra) => (
              <div key={extra.label}>
                <dt>{extra.label}</dt>
                <dd>{extra.value}</dd>
              </div>
            ))}
            {product.dimensionsMm
              && (product.dimensionsMm.length || product.dimensionsMm.width || product.dimensionsMm.height) ? (
              <div>
                <dt>Dimensioni</dt>
                <dd>
                  {[
                    product.dimensionsMm.length,
                    product.dimensionsMm.width,
                    product.dimensionsMm.height,
                  ]
                    .filter(Boolean)
                    .join(" × ")}{" "}
                  mm
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}
    </div>
  );
};

export default ProductDetailPage;
