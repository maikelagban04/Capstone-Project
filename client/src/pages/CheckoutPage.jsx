import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const [billing, setBilling] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth?.token) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await apiRequest("/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
        }),
      });

      clearCart();
      navigate("/orders", { replace: true });
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <section className="empty-showcase">
        <span className="eyebrow">Checkout</span>
        <h1>Il carrello è vuoto.</h1>
        <p>Aggiungi dei prodotti prima di completare l'ordine.</p>
      </section>
    );
  }

  return (
    <div className="stack-2xl">
      <section className="section-head">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Pagamento sicuro e riepilogo chiaro, senza distrazioni.</h1>
        </div>
        <div className="summary-pill">
          <small>Totale ordine</small>
          <strong>€ {total.toFixed(2)}</strong>
        </div>
      </section>

      {message ? <div className="alert alert-danger">{message}</div> : null}

      <section className="checkout-layout-premium">
        <form className="card checkout-form-card" onSubmit={handleSubmit}>
          <div className="checkout-section-title">
            <h2>Dati di fatturazione</h2>
            <p>Compila le informazioni essenziali per finalizzare l'ordine.</p>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nome completo</label>
              <input
                className="form-control"
                value={billing.fullName}
                onChange={(event) => setBilling({ ...billing, fullName: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={billing.email}
                onChange={(event) => setBilling({ ...billing, email: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Paese</label>
              <input
                className="form-control"
                value={billing.country}
                onChange={(event) => setBilling({ ...billing, country: event.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Indirizzo</label>
              <input
                className="form-control"
                value={billing.address}
                onChange={(event) => setBilling({ ...billing, address: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Città</label>
              <input
                className="form-control"
                value={billing.city}
                onChange={(event) => setBilling({ ...billing, city: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">CAP</label>
              <input
                className="form-control"
                value={billing.zip}
                onChange={(event) => setBilling({ ...billing, zip: event.target.value })}
                required
              />
            </div>
          </div>

          <div className="checkout-section-title mt-4">
            <h2>Metodo di pagamento</h2>
            <p>UI semplice, chiara e pronta per una futura integrazione reale.</p>
          </div>

          <div className="payment-choice-grid">
            <label className={`payment-choice ${paymentMethod === "card" ? "is-active" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <span>Carta di credito o debito</span>
            </label>
            <label className={`payment-choice ${paymentMethod === "paypal" ? "is-active" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
              />
              <span>PayPal</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-premium mt-4" disabled={submitting}>
            {submitting ? "Invio ordine..." : "Conferma acquisto"}
          </button>
        </form>

        <aside className="card checkout-summary-card">
          <div className="checkout-section-title">
            <h2>Riepilogo ordine</h2>
            <p>Controlla articoli e quantità prima della conferma.</p>
          </div>

          <div className="stack-md">
            {cartItems.map((item) => (
              <article key={item._id} className="checkout-item-row">
                <img src={item.image} alt={item.title} className="checkout-item-row__image" loading="lazy" />
                <div>
                  <strong>{item.title}</strong>
                  <p>x{item.quantity} · € {item.finalPrice.toFixed(2)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-line">
            <span>Subtotale</span>
            <strong>€ {total.toFixed(2)}</strong>
          </div>
          <div className="summary-line">
            <span>Imposte</span>
            <strong>Calcolate al checkout</strong>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CheckoutPage;
