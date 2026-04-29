import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const OrdersPage = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await apiRequest("/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setOrders(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [auth?.token]);

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Ordini</span>
          <h1>Storico ordini.</h1>
        </div>
      </section>

      {loading ? <div className="empty-panel">Caricamento ordini...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && orders.length === 0 ? <div className="empty-panel">Nessun ordine disponibile.</div> : null}

      <section className="order-grid">
        {orders.map((order) => (
          <article key={order._id} className="order-card">
            <div className="order-card__head">
              <strong>#{order._id.slice(-6).toUpperCase()}</strong>
              <span className={`stock-pill ${order.status === "delivered" ? "is-available" : "is-empty"}`}>{order.status}</span>
            </div>
            <p>Totale: € {order.totalAmount.toFixed(2)}</p>
            <div className="order-card__items">
              {order.items.map((item) => (
                <div key={`${order._id}-${item.product}`}>
                  <span>{item.title} x {item.quantity}</span>
                  <strong>€ {item.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default OrdersPage;
