import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const [billing, setBilling] = useState({ fullName: "", email: "", address: "", city: "", zip: "", country: "" });
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
      <section className="card empty-state">
        <span className="eyebrow">Checkout</span>
        <h1>Your cart is empty</h1>
        <p>Add products to the cart before completing your order.</p>
      </section>
    );
  }

  return (
    <div className="checkout-layout stack-lg">
      <section className="card p-4 p-lg-5">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Secure payment and fast fulfillment</h1>
          </div>
          <strong className="text-primary">Order total EUR {total.toFixed(2)}</strong>
        </div>

        {message ? <div className="alert alert-danger">{message}</div> : null}

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card p-4 bg-surface rounded-4">
              <h2 className="h5 mb-3">Billing details</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Full name</label>
                  <input className="form-control" value={billing.fullName} onChange={(e) => setBilling({ ...billing, fullName: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Country</label>
                  <input className="form-control" value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input className="form-control" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ZIP code</label>
                  <input className="form-control" value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} required />
                </div>

                <div className="col-12">
                  <h3 className="h6 mb-2">Payment</h3>
                  <div className="d-flex flex-column gap-2">
                    <label className={`btn btn-outline-secondary ${paymentMethod === "card" ? "active" : ""}`}>
                      <input type="radio" name="payment" className="btn-check" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                      Credit & debit card
                    </label>
                    <label className={`btn btn-outline-secondary ${paymentMethod === "paypal" ? "active" : ""}`}>
                      <input type="radio" name="payment" className="btn-check" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
                      PayPal
                    </label>
                  </div>
                </div>

                <div className="col-12 d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                    {submitting ? "Processing order..." : "Confirm purchase"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="col-lg-5">
            <div className="card p-4 rounded-4 bg-surface shadow-sm">
              <h2 className="h5 mb-3">Order summary</h2>
              <div className="stack-sm">
                {cartItems.map((item) => (
                  <div key={item._id} className="d-flex align-items-center gap-3 py-3 border-bottom">
                    <img src={item.image} alt={item.title} className="checkout-thumb rounded-3" loading="lazy" />
                    <div>
                      <p className="mb-1 fw-semibold">{item.title}</p>
                      <small className="text-secondary">x{item.quantity} · EUR {item.finalPrice.toFixed(2)}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider my-4"></div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Subtotal</span>
                <strong>EUR {total.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center text-secondary">
                <span>Estimated tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
