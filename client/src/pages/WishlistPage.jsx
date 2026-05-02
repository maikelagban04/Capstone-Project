import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import ProductCard from "../components/ProductCard";
import { HeartIcon } from "../components/icons";

const WishlistPage = () => {
  const { items, loading } = useWishlist() || {};

  const count = items?.length || 0;

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Account</span>
          <h1>La mia wishlist</h1>
          <p className="section-subtitle">
            {count === 0
              ? "Nessun prodotto salvato."
              : `${count} ${count === 1 ? "prodotto salvato" : "prodotti salvati"} per te.`}
          </p>
        </div>
      </section>

      {loading ? <div className="empty-panel">Caricamento wishlist...</div> : null}

      {!loading && count === 0 ? (
        <div className="empty-panel wishlist-empty">
          <HeartIcon />
          <strong>La tua wishlist è vuota</strong>
          <p>
            Salva i prodotti che ami cliccando sul cuore. Li ritroverai qui quando vuoi.
          </p>
          <Link to="/catalog" className="btn-shell btn-shell--primary">
            Esplora il catalogo
          </Link>
        </div>
      ) : null}

      {!loading && count > 0 ? (
        <section className="product-grid">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      ) : null}
    </div>
  );
};

export default WishlistPage;
