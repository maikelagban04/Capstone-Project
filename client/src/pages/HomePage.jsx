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

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const categories = useMemo(() => {
    const grouped = products.reduce((accumulator, product) => {
      accumulator[product.componentType] = (accumulator[product.componentType] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
      .slice(0, 6);
  }, [products]);

  const heroCategory = categories[0]?.[0] || "Componenti";

  return (
    <div className="page-stack">
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="section-kicker">Hardware Store</span>
          <h1>Componenti PC selezionati con una home finalmente essenziale.</h1>
          <p>
            KyronTech è pensato per chi vuole trovare subito CPU, GPU, RAM, storage e altri componenti senza
            rumore visivo, senza blocchi inutili e con un percorso d’acquisto chiaro.
          </p>
          <div className="hero__actions">
            <Link to="/catalog" className="btn btn-primary btn-shell btn-shell--primary">
              Vai al catalogo
            </Link>
            <Link
              to={heroCategory ? `/catalog?componentType=${encodeURIComponent(heroCategory)}` : "/catalog"}
              className="btn btn-outline-secondary btn-shell"
            >
              Esplora {heroCategory}
            </Link>
          </div>
        </div>

        <div className="home-hero__panel">
          <div className="home-hero__panel-top">
            <small>Focus attuale</small>
            <strong>{heroCategory}</strong>
          </div>
          <div className="home-hero__category-list">
            {categories.map(([type, count]) => (
              <Link key={type} to={`/catalog?componentType=${encodeURIComponent(type)}`} className="home-hero__category-row">
                <span>{type}</span>
                <strong>{count}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-head">
        <div>
          <span className="section-kicker">Categorie</span>
          <h2>Il catalogo è organizzato intorno ai veri tipi di prodotto.</h2>
        </div>
      </section>

      <section className="home-categories-grid">
        {categories.map(([type, count]) => (
          <Link key={type} to={`/catalog?componentType=${encodeURIComponent(type)}`} className="home-category-card">
            <small>{count} prodotti</small>
            <strong>{type}</strong>
            <span>Apri selezione</span>
          </Link>
        ))}
      </section>

      <section className="section-head">
        <div>
          <span className="section-kicker">Selezione</span>
          <h2>Prodotti in evidenza.</h2>
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
