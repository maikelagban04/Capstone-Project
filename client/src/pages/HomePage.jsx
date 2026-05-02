import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";
import {
  ArrowRightIcon,
  CpuIcon,
  QuoteIcon,
  ShieldIcon,
  StarIcon,
  TrendingUpIcon,
  ZapIcon,
} from "../components/icons";

const CATEGORY_ICONS = {
  GPU: "🎮",
  CPU: "⚡",
  Motherboard: "🔧",
  RAM: "💾",
  SSD: "💿",
  HDD: "💿",
  Storage: "💿",
  PSU: "🔌",
  Cooling: "❄️",
  Case: "📦",
};

const CATEGORY_LABELS = {
  GPU: "Schede video",
  CPU: "Processori",
  Motherboard: "Schede madri",
  RAM: "Memorie RAM",
  SSD: "Storage SSD",
  HDD: "Storage HDD",
  Storage: "Storage",
  PSU: "Alimentatori",
  Cooling: "Raffreddamento",
  Case: "Case",
};

const TESTIMONIALS = [
  {
    name: "Alessandro Conti",
    role: "Streamer professionista",
    text:
      "Ho costruito il mio setup da streaming con KyronTech. Qualità impeccabile e il supporto tecnico è davvero eccezionale.",
    rating: 5,
  },
  {
    name: "Sara Bianchi",
    role: "Game Developer",
    text:
      "Il PC Builder mi ha aiutata a scegliere i componenti giusti per la workstation. Prestazioni al top senza sorprese.",
    rating: 5,
  },
  {
    name: "Marco Rossi",
    role: "Pro gamer esports",
    text:
      "Spedizione veloce, prezzi competitivi e prodotti originali. Il mio store di riferimento per ogni upgrade.",
    rating: 5,
  },
];

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

  const totalProducts = products.length;
  const heroImage =
    products.find((p) => p.componentType === "GPU")?.image ||
    products[0]?.image ||
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80";

  return (
    <div className="home-page">
      {/* HERO --------------------------------------------------------------- */}
      <section className="home-hero-v2">
        <div className="home-hero-v2__bg" aria-hidden="true" />
        <div className="home-hero-v2__inner">
          <div className="home-hero-v2__copy">
            <span className="home-hero-v2__pill">
              <ZapIcon /> Performance next-gen
            </span>
            <h1 className="home-hero-v2__title">
              Costruisci il tuo PC dei sogni.
            </h1>
            <p className="home-hero-v2__lead">
              Componenti premium per gamer, creator ed enthusiast. Prestazioni senza compromessi
              con una selezione curata dell'hardware più avanzato.
            </p>
            <div className="home-hero-v2__actions">
              <Link to="/catalog" className="btn-shell btn-shell--primary btn-shell--lg">
                Vai al catalogo <ArrowRightIcon />
              </Link>
              <Link to="/pc-builder" className="btn-shell btn-shell--lg">
                Configura il tuo PC
              </Link>
            </div>
            <div className="home-hero-v2__stats">
              <div>
                <strong>{totalProducts > 0 ? `${totalProducts}+` : "500+"}</strong>
                <small>Prodotti</small>
              </div>
              <div>
                <strong>10K+</strong>
                <small>Clienti soddisfatti</small>
              </div>
              <div>
                <strong>24/7</strong>
                <small>Supporto</small>
              </div>
            </div>
          </div>
          <div className="home-hero-v2__visual">
            <div className="home-hero-v2__glow" aria-hidden="true" />
            <img src={heroImage} alt="PC Gaming" className="home-hero-v2__image" />
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS -------------------------------------------------- */}
      <section className="home-section">
        <div className="home-section__head">
          <div>
            <h2>Prodotti in evidenza</h2>
            <p className="home-section__sub">Le scelte top per la tua prossima build</p>
          </div>
          <Link to="/catalog" className="home-section__link">
            Vedi tutti <ArrowRightIcon />
          </Link>
        </div>
        {loading ? <div className="empty-panel">Caricamento prodotti...</div> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* CATEGORIES --------------------------------------------------------- */}
      <section className="home-section">
        <div className="home-section__head home-section__head--center">
          <div>
            <h2>Sfoglia per categoria</h2>
            <p className="home-section__sub">Trova esattamente quello che ti serve</p>
          </div>
        </div>
        <div className="home-cat-grid">
          {categories.map(([type, count]) => (
            <Link
              key={type}
              to={`/catalog?componentType=${encodeURIComponent(type)}`}
              className="home-cat-card"
            >
              <span className="home-cat-card__icon" aria-hidden="true">
                {CATEGORY_ICONS[type] || "🧩"}
              </span>
              <strong>{CATEGORY_LABELS[type] || type}</strong>
              <small>{count} prodotti</small>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES STRIPE --------------------------------------------------- */}
      <section className="home-features">
        <div className="home-features__inner">
          <article className="home-feature">
            <div className="home-feature__icon">
              <ShieldIcon />
            </div>
            <h3>Prodotti originali</h3>
            <p>100% componenti autentici da distributori autorizzati.</p>
          </article>
          <article className="home-feature">
            <div className="home-feature__icon">
              <ZapIcon />
            </div>
            <h3>Spedizione veloce</h3>
            <p>Gratuita sopra i 99€, consegna in 2-3 giorni lavorativi.</p>
          </article>
          <article className="home-feature">
            <div className="home-feature__icon">
              <TrendingUpIcon />
            </div>
            <h3>Supporto esperto</h3>
            <p>Assistenza 24/7 da specialisti dell'assemblaggio PC.</p>
          </article>
        </div>
      </section>

      {/* TESTIMONIALS ------------------------------------------------------- */}
      <section className="home-section">
        <div className="home-section__head home-section__head--center">
          <div>
            <h2>Cosa dicono i clienti</h2>
            <p className="home-section__sub">Migliaia di builder ci hanno scelto</p>
          </div>
        </div>
        <div className="home-testimonials">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="home-testimonial">
              <QuoteIcon className="home-testimonial__quote" />
              <div className="home-testimonial__stars">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <StarIcon key={idx} filled />
                ))}
              </div>
              <p className="home-testimonial__text">{t.text}</p>
              <div className="home-testimonial__author">
                <strong>{t.name}</strong>
                <small>{t.role}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BUILDER CTA -------------------------------------------------------- */}
      <section className="home-section">
        <div className="home-builder-banner">
          <CpuIcon className="home-builder-banner__icon" />
          <h2>Pronto a costruire?</h2>
          <p>
            Usa il nostro PC Builder interattivo per creare il setup perfetto.
            Controllo compatibilità, stima wattaggio e consigli tecnici in tempo reale.
          </p>
          <Link to="/pc-builder" className="home-builder-banner__cta">
            Inizia la tua build <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
