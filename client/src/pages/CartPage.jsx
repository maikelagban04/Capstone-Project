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

  if (cartItems.length === 0) {
    return (
      <section className="empty-panel">
        <span className="section-kicker">Carrello</span>
        <h1>Il carrello è vuoto.</h1>
        <p>Aggiungi componenti dal catalogo per iniziare il checkout.</p>
        <Link to="/catalog" className="btn btn-primary btn-shell btn-shell--primary">
          Apri catalogo
        </Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Carrello</span>
          <h1>Carrello</h1>
        </div>
      </section>

      <section className="cart-layout">
        <div className="cart-list">
          {cartItems.map((item) => (
            <article key={item._id} className="cart-item">
              <img src={item.image} alt={item.title} />
              <div className="cart-item__body">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.brand} · {item.model}</p>
                </div>
                <strong>€ {item.finalPrice.toFixed(2)}</strong>
              </div>
              <div className="cart-item__actions">
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item._id, Number(event.target.value))}
                />
                <button type="button" className="btn btn-outline-secondary btn-shell" onClick={() => removeFromCart(item._id)}>
                  Rimuovi
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <span className="section-kicker">Totale</span>
          <h2>€ {total.toFixed(2)}</h2>
          <p>{cartItems.length} articoli nel carrello.</p>
          <button type="button" className="btn btn-primary btn-shell btn-shell--primary" onClick={handleProceed}>
            Procedi al checkout
          </button>
          <button type="button" className="btn btn-outline-secondary btn-shell" onClick={clearCart}>
            Svuota carrello
          </button>
        </aside>
      </section>
    </div>
  );
};

export default CartPage;
