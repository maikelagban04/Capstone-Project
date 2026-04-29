import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiRequest("/products");
        setProducts(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 6), [products]);

  const componentGroups = useMemo(() => {
    const counts = products.reduce((accumulator, product) => {
      accumulator[product.componentType] = (accumulator[product.componentType] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
      .slice(0, 4);
  }, [products]);

  const brandCount = useMemo(() => new Set(products.map((product) => product.brand)).size, [products]);

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__copy">
          <span className="section-kicker">KyronTech</span>
          <h1>Componenti PC scelti bene, trovati in fretta, acquistati senza attrito.</h1>
          <p>
            Un ecommerce pensato per CPU, GPU, RAM, storage, motherboard, PSU e tutto il resto dell'ecosistema PC.
            Navigazione semplice, dettaglio prodotto utile e acquisto pulito.
          </p>
          <div className="hero__actions">
            <Link to="/catalog" className="btn btn-primary btn-shell btn-shell--primary">
              Esplora catalogo
            </Link>
            <Link to="/cart" className="btn btn-outline-secondary btn-shell">
              Vai al carrello
            </Link>
          </div>
        </div>

        <div className="hero__panel">
          <div className="metric-grid">
            <article>
              <small>Prodotti</small>
              <strong>{products.length}</strong>
            </article>
            <article>
              <small>Brand</small>
              <strong>{brandCount}</strong>
            </article>
            <article>
              <small>Tipi componente</small>
              <strong>{componentGroups.length}</strong>
            </article>
          </div>

          <div className="hero__list">
            {componentGroups.map(([type, count]) => (
              <div key={type} className="hero__list-item">
                <strong>{type}</strong>
                <span>{count} prodotti disponibili</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-head">
        <div>
          <span className="section-kicker">Categorie principali</span>
          <h2>La home riflette i dati reali del catalogo.</h2>
        </div>
      </section>

      <section className="category-grid">
        {componentGroups.map(([type, count]) => (
          <article key={type} className="category-tile">
            <strong>{type}</strong>
            <p>{count} articoli in questa categoria.</p>
            <Link to={`/catalog?componentType=${encodeURIComponent(type)}`}>Apri categoria</Link>
          </article>
        ))}
      </section>

      <section className="section-head">
        <div>
          <span className="section-kicker">In evidenza</span>
          <h2>Ultimi prodotti pubblicati.</h2>
        </div>
      </section>

      {loading ? <div className="empty-panel">Caricamento prodotti...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading ? (
        <section className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      ) : null}
    </div>
  );
};

export default HomePage;
