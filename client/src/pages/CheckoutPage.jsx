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
      <section className="empty-panel">
        <span className="section-kicker">Checkout</span>
        <h1>Nessun articolo da acquistare.</h1>
        <p>Torna al catalogo e aggiungi dei prodotti al carrello.</p>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Checkout</span>
          <h1>Checkout lineare, chiaro e orientato alla conclusione ordine.</h1>
        </div>
      </section>

      {message ? <div className="alert alert-danger">{message}</div> : null}

      <section className="checkout-layout">
        <form className="checkout-card" onSubmit={handleSubmit}>
          <div className="checkout-card__section">
            <h2>Dati cliente</h2>
            <div className="row g-3">
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Nome completo"
                  value={billing.fullName}
                  onChange={(event) => setBilling({ ...billing, fullName: event.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={billing.email}
                  onChange={(event) => setBilling({ ...billing, email: event.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Paese"
                  value={billing.country}
                  onChange={(event) => setBilling({ ...billing, country: event.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Indirizzo"
                  value={billing.address}
                  onChange={(event) => setBilling({ ...billing, address: event.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Città"
                  value={billing.city}
                  onChange={(event) => setBilling({ ...billing, city: event.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="CAP"
                  value={billing.zip}
                  onChange={(event) => setBilling({ ...billing, zip: event.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-card__section">
            <h2>Pagamento</h2>
            <div className="payment-grid">
              {[
                ["card", "Carta"],
                ["paypal", "PayPal"],
              ].map(([value, label]) => (
                <label key={value} className={`payment-option ${paymentMethod === value ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-shell btn-shell--primary" disabled={submitting}>
            {submitting ? "Invio ordine..." : "Conferma acquisto"}
          </button>
        </form>

        <aside className="summary-card">
          <span className="section-kicker">Riepilogo</span>
          <h2>€ {total.toFixed(2)}</h2>
          <div className="checkout-summary">
            {cartItems.map((item) => (
              <div key={item._id}>
                <strong>{item.title}</strong>
                <span>x{item.quantity} · € {item.finalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CheckoutPage;
