import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";
import { CpuIcon, ZapIcon } from "../components/icons";

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
          <span className="section-kicker">KyronTech</span>
          <h1>Componenti PC selezionati.</h1>
          <p>
            CPU, GPU, RAM, storage e hardware scelto per build da gaming e workstation.
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
          <h2>Categorie principali.</h2>
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

      <section className="home-builder-cta">
        <div className="home-builder-cta__icon" aria-hidden="true">
          <CpuIcon />
        </div>
        <div className="home-builder-cta__body">
          <span className="section-kicker">
            <ZapIcon /> Tool
          </span>
          <h2>Costruisci il tuo PC con il configuratore.</h2>
          <p>
            Scegli CPU, scheda madre, GPU e tutto il resto: verifichiamo automaticamente
            socket, memoria e wattaggio per assicurarci che la build sia compatibile.
          </p>
          <div className="hero__actions">
            <Link to="/pc-builder" className="btn btn-primary btn-shell btn-shell--primary">
              Apri PC Builder
            </Link>
            <Link to="/support" className="btn btn-outline-secondary btn-shell">
              Serve aiuto?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
