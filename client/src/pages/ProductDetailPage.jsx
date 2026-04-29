import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";

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

  const specificationEntries = useMemo(
    () => Object.entries(product?.specifications || {}).filter(([, value]) => value),
    [product],
  );

  const compatibilityEntries = useMemo(
    () => Object.entries(product?.compatibility || {}).filter(([, value]) => value),
    [product],
  );

  if (loading) {
    return <div className="empty-showcase">Caricamento scheda prodotto...</div>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!product) {
    return <div className="empty-showcase">Prodotto non trovato.</div>;
  }

  return (
    <div className="stack-2xl">
      <section className="product-detail-layout">
        <div className="product-gallery card">
          <span className="product-chip">{product.componentType || product.category}</span>
          <img src={product.image} alt={product.title} className="product-gallery__image" loading="lazy" />
        </div>

        <div className="product-summary">
          <div className="product-summary__intro">
            <span className="eyebrow">Scheda prodotto</span>
            <h1>{product.title}</h1>
            <p className="product-summary__brand">{product.brand} {product.model ? `· ${product.model}` : ""}</p>
            <p className="product-summary__description">{product.description}</p>
          </div>

          <div className="summary-metrics">
            <div className="metric-card">
              <span>Prezzo base</span>
              <strong>€ {product.priceBase.toFixed(2)}</strong>
            </div>
            <div className="metric-card">
              <span>Markup</span>
              <strong>{product.markup}%</strong>
            </div>
            <div className="metric-card">
              <span>Prezzo finale</span>
              <strong>€ {product.finalPrice.toFixed(2)}</strong>
            </div>
            <div className="metric-card">
              <span>Stock</span>
              <strong>{product.stock > 0 ? `${product.stock} unità` : "Esaurito"}</strong>
            </div>
          </div>

          <div className="purchase-panel">
            <div>
              <small>Disponibilità</small>
              <strong className={product.inStock ? "text-success" : "text-danger"}>
                {product.inStock ? "Pronto per la spedizione" : "Momentaneamente esaurito"}
              </strong>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-premium"
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              {product.inStock ? "Aggiungi al carrello" : "Non disponibile"}
            </button>
          </div>
        </div>
      </section>

      <section className="product-info-grid">
        <article className="card info-panel">
          <div className="section-head section-head--tight">
            <div>
              <span className="eyebrow">Specifiche</span>
              <h2>Dettagli tecnici</h2>
            </div>
          </div>
          {specificationEntries.length > 0 ? (
            <dl className="spec-grid">
              {specificationEntries.map(([key, value]) => (
                <div key={key} className="spec-item">
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted mb-0">Nessuna specifica tecnica aggiuntiva disponibile.</p>
          )}
        </article>

        <article className="card info-panel">
          <div className="section-head section-head--tight">
            <div>
              <span className="eyebrow">Compatibilità</span>
              <h2>Check rapido build</h2>
            </div>
          </div>
          {compatibilityEntries.length > 0 ? (
            <dl className="spec-grid">
              {compatibilityEntries.map(([key, value]) => (
                <div key={key} className="spec-item">
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted mb-0">Compatibilità specifica non indicata per questo prodotto.</p>
          )}
        </article>
      </section>
    </div>
  );
};

export default ProductDetailPage;
