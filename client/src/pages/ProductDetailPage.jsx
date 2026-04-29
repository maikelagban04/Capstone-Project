import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";
import {
  formatKeyLabel,
  getCompatibilityEntries,
  getProductMeta,
  getSpecificationEntries,
} from "../utils/productHelpers";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="page-stack">
      <section className="product-layout">
        <div className="product-view">
          <img src={product.image} alt={product.title} className="product-view__image" />
        </div>

        <aside className="product-summary">
          <span className="section-kicker">{product.componentType}</span>
          <h1>{product.title}</h1>
          <p className="product-summary__meta">{getProductMeta(product)}</p>
          <p className="product-summary__description">{product.description}</p>

          <div className="product-summary__stats">
            <div>
              <small>Prezzo finale</small>
              <strong>€ {product.finalPrice.toFixed(2)}</strong>
            </div>
            <div>
              <small>Prezzo base</small>
              <strong>€ {product.priceBase.toFixed(2)}</strong>
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
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              {product.inStock ? "Aggiungi al carrello" : "Non disponibile"}
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
