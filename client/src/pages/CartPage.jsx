import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    if (!auth?.token) {
      navigate("/login");
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
          items: cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        }),
      });
      clearCart();
      setMessage("Order created successfully.");
      navigate("/orders");
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack-lg">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Cart</span>
          <h1>Your selected products</h1>
        </div>
        <strong>EUR {total.toFixed(2)}</strong>
      </div>

      {message ? <p className="error-text">{message}</p> : null}

      {cartItems.length === 0 ? (
        <div className="card empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="button">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="stack-md">
            {cartItems.map((item) => (
              <article key={item._id} className="card cart-row">
                <img src={item.image} alt={item.title} className="cart-row__image" />
                <div className="stack-sm cart-row__content">
                  <h3>{item.title}</h3>
                  <p>EUR {item.finalPrice.toFixed(2)} each</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item._id, Number(event.target.value))}
                />
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="checkout-bar">
            <div>
              <p>Total order value</p>
              <strong>EUR {total.toFixed(2)}</strong>
            </div>
            <button type="button" className="button" onClick={handleCheckout} disabled={submitting}>
              {submitting ? "Processing..." : "Create order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
