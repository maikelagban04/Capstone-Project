import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { CloseIcon, TrashIcon } from "./icons";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    total,
  } = useCart();

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      window.addEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    if (!auth?.token) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? "is-open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`cart-drawer ${isCartOpen ? "is-open" : ""}`}
        role="dialog"
        aria-label="Carrello"
        aria-hidden={!isCartOpen}
      >
        <div className="cart-drawer__header">
          <h2>Carrello ({cartItems.length})</h2>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label="Chiudi carrello">
            <CloseIcon />
          </button>
        </div>

        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <strong>Il carrello è vuoto.</strong>
              <span>Aggiungi componenti dal catalogo per iniziare.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <article key={item._id} className="cart-row">
                <img src={item.image} alt={item.title} className="cart-row__media" />
                <div>
                  <p className="cart-row__title">{item.title}</p>
                  <div className="cart-row__price">€ {Number(item.finalPrice).toFixed(2)}</div>
                  <div className="cart-row__qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      aria-label="Diminuisci"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      aria-label="Aumenta"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-row__remove"
                  onClick={() => removeFromCart(item._id)}
                  aria-label="Rimuovi"
                >
                  <TrashIcon />
                </button>
              </article>
            ))
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__totals">
              <span>Totale</span>
              <strong>€ {total.toFixed(2)}</strong>
            </div>
            <button
              type="button"
              className="btn-shell btn-shell--light btn-shell--block"
              onClick={handleCheckout}
            >
              Procedi al checkout
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
};

export default CartDrawer;
