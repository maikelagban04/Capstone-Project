import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();

  const handleProceed = () => {
    if (!auth?.token) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="stack-2xl">
      <section className="section-head">
        <div>
          <span className="eyebrow">Carrello</span>
          <h1>Un checkout semplice, pulito e orientato alla conversione.</h1>
        </div>
        <div className="summary-pill">
          <small>Totale stimato</small>
          <strong>€ {total.toFixed(2)}</strong>
        </div>
      </section>

      {cartItems.length === 0 ? (
        <section className="empty-showcase">
          <span className="eyebrow">Carrello vuoto</span>
          <h2>La tua prossima build parte da qui.</h2>
          <p>Aggiungi componenti premium e torna qui per un checkout rapido.</p>
          <Link to="/catalog" className="btn btn-primary btn-premium">
            Vai al catalogo
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="stack-lg">
            {cartItems.map((item) => (
              <article key={item._id} className="cart-row-premium card">
                <img src={item.image} alt={item.title} className="cart-row-premium__image" loading="lazy" />
                <div className="cart-row-premium__content">
                  <div>
                    <p className="product-card__meta">{item.brand} {item.model ? `· ${item.model}` : ""}</p>
                    <h3>{item.title}</h3>
                    <p className="text-muted mb-0">€ {item.finalPrice.toFixed(2)} per unità</p>
                  </div>
                  <div className="cart-row-premium__controls">
                    <div className="quantity-box">
                      <label htmlFor={`quantity-${item._id}`}>Qtà</label>
                      <input
                        id={`quantity-${item._id}`}
                        type="number"
                        min="1"
                        className="form-control"
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item._id, Number(event.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-premium-outline"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="card checkout-sidebar">
            <span className="eyebrow">Riepilogo</span>
            <h2>Pronto per chiudere l'ordine?</h2>
            <div className="stack-md">
              <div className="summary-line">
                <span>Articoli</span>
                <strong>{cartItems.length}</strong>
              </div>
              <div className="summary-line">
                <span>Subtotale</span>
                <strong>€ {total.toFixed(2)}</strong>
              </div>
            </div>
            <button type="button" className="btn btn-primary btn-lg btn-premium" onClick={handleProceed}>
              Procedi al checkout
            </button>
            <button type="button" className="btn btn-outline-secondary btn-premium-outline" onClick={clearCart}>
              Svuota carrello
            </button>
          </aside>
        </section>
      )}
    </div>
  );
};

export default CartPage;
