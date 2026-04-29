import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const categoryHighlights = [
  { title: "CPU e GPU", text: "Componenti flagship per gaming competitivo e workstation spinte." },
  { title: "RAM e Storage", text: "Prestazioni rapide, latenza ridotta e affidabilità per ogni build." },
  { title: "Motherboard e PSU", text: "Base solida per sistemi bilanciati, stabili e futuri upgrade." },
];

const trustHighlights = [
  "Solo brand selezionati e componenti verificati",
  "Filtri rapidi per compatibilità, stock e fascia prezzo",
  "Esperienza d'acquisto fluida da mobile a desktop",
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await apiRequest("/products?limit=6");
        setFeatured(data.slice(0, 6));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="stack-2xl">
      <section className="hero-premium">
        <div className="hero-premium__content">
          <span className="eyebrow">Hardware boutique</span>
          <h1>Componenti PC premium progettati per build che devono stupire.</h1>
          <p>
            KyronTech unisce il feeling editoriale dei brand premium con la praticità di un ecommerce ottimizzato per
            conversione, confronto prodotti e acquisti veloci.
          </p>

          <div className="hero-premium__actions">
            <Link to="/catalog" className="btn btn-primary btn-lg btn-premium">
              Esplora il catalogo
            </Link>
            <Link to="/cart" className="btn btn-outline-secondary btn-lg btn-premium-outline">
              Vai al carrello
            </Link>
          </div>

          <div className="hero-stats">
            <div className="metric-card">
              <strong>48h</strong>
              <span>evasione media ordini</span>
            </div>
            <div className="metric-card">
              <strong>Top brand</strong>
              <span>selezione orientata a qualità e affidabilità</span>
            </div>
            <div className="metric-card">
              <strong>Mobile first</strong>
              <span>UX fluida anche durante checkout rapido</span>
            </div>
          </div>
        </div>

        <div className="hero-premium__visual">
          <div className="hero-visual-card glass-panel">
            <div className="hero-visual-card__top">
              <span className="status-dot" />
              <span>Build intelligence</span>
            </div>
            <h2>Seleziona i componenti giusti più in fretta.</h2>
            <div className="stack-lg">
              {categoryHighlights.map((item) => (
                <div key={item.title} className="hero-feature-row">
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band">
        {trustHighlights.map((item) => (
          <article key={item} className="trust-band__item">
            <span className="trust-band__icon">•</span>
            <p>{item}</p>
          </article>
        ))}
      </section>

      <section className="section-head">
        <div>
          <span className="eyebrow">Categorie chiave</span>
          <h2>Una UI costruita per decidere bene e comprare più velocemente.</h2>
        </div>
      </section>

      <section className="spotlight-grid">
        {categoryHighlights.map((item) => (
          <article key={item.title} className="spotlight-card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="section-head">
        <div>
          <span className="eyebrow">Best seller</span>
          <h2>Prodotti in evidenza per la tua prossima build.</h2>
        </div>
        <Link to="/catalog" className="section-link">
          Vedi tutto il catalogo
        </Link>
      </section>

      {loading ? <div className="empty-showcase">Caricamento prodotti in corso...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading ? (
        <section className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      ) : null}
    </div>
  );
};

export default HomePage;
