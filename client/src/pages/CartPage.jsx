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
    <div className="cart-page stack-lg">
      <div className="section-heading d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        <div>
          <span className="eyebrow">Cart</span>
          <h1>Review your selected items</h1>
        </div>
        <div className="text-end">
          <p className="text-muted mb-1">Estimated order value</p>
          <strong className="fs-4">EUR {total.toFixed(2)}</strong>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="card empty-state text-center py-5">
          <span className="eyebrow">Empty cart</span>
          <h2 className="h4 mt-3">Your cart is waiting</h2>
          <p className="text-muted">Add premium parts to get a smooth checkout experience.</p>
          <Link to="/catalog" className="btn btn-primary mt-3">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card p-4 rounded-4 shadow-sm">
              <div className="stack-md">
                {cartItems.map((item) => (
                  <article key={item._id} className="cart-item d-flex flex-column flex-sm-row align-items-center gap-3 p-3 rounded-4 bg-surface">
                    <img src={item.image} alt={item.title} className="cart-thumb rounded-4" loading="lazy" />
                    <div className="flex-grow-1">
                      <h3 className="h6 mb-1">{item.title}</h3>
                      <p className="text-secondary mb-2">EUR {item.finalPrice.toFixed(2)} each</p>
                      <div className="d-flex gap-2 flex-wrap align-items-center">
                        <label className="small text-muted">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="form-control form-control-sm quantity-input"
                          onChange={(event) => updateQuantity(item._id, Number(event.target.value))}
                        />
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => removeFromCart(item._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="col-lg-4">
            <div className="card p-4 rounded-4 shadow-sm sticky-panel">
              <div className="mb-4">
                <p className="text-muted mb-1">Cart subtotal</p>
                <strong className="fs-3">EUR {total.toFixed(2)}</strong>
              </div>
              <button type="button" className="btn btn-primary w-100" onClick={handleProceed}>
                Proceed to checkout
              </button>
              <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
