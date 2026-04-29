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
    <div className="stack-2xl">
      <section className="section-head">
        <div>
          <span className="eyebrow">Ordini</span>
          <h1>Storico ordini chiaro e leggibile in pochi secondi.</h1>
        </div>
      </section>

      {loading ? <div className="empty-showcase">Caricamento ordini...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && orders.length === 0 ? (
        <div className="empty-showcase">Non ci sono ancora ordini associati a questo account.</div>
      ) : null}

      <div className="orders-grid">
        {orders.map((order) => (
          <article key={order._id} className="card order-card-premium">
            <div className="order-card-premium__header">
              <div>
                <small>Order ID</small>
                <strong>#{order._id.slice(-6).toUpperCase()}</strong>
              </div>
              <span className={`status-badge status-badge--${order.status}`}>{order.status}</span>
            </div>

            <div className="summary-line">
              <span>Totale</span>
              <strong>€ {order.totalAmount.toFixed(2)}</strong>
            </div>

            <div className="stack-sm">
              {order.items.map((item) => (
                <div key={`${order._id}-${item.product}`} className="order-line">
                  <span>{item.title} x {item.quantity}</span>
                  <strong>€ {item.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
