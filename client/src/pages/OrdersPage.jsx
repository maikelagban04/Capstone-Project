import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { CalendarIcon, ReceiptIcon } from "../components/icons";

const STATUS_LABELS = {
  delivered: "Consegnato",
  shipped: "Spedito",
  processing: "In lavorazione",
  pending: "In attesa",
  cancelled: "Annullato",
  paid: "Pagato",
};

const statusModifier = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized === "delivered" || normalized === "paid") return "is-delivered";
  if (normalized === "shipped") return "is-shipped";
  if (normalized === "cancelled") return "is-cancelled";
  return "is-processing";
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const OrdersPage = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await apiRequest("/orders/my-orders", {
          headers: { Authorization: `Bearer ${auth.token}` },
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
          <span className="section-kicker">Account</span>
          <h1>Storico ordini</h1>
        </div>
      </section>

      {loading ? <div className="empty-panel">Caricamento ordini...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && orders.length === 0 ? (
        <div className="empty-panel">
          <strong>Nessun ordine ancora.</strong>
          <p>Quando completi un acquisto lo trovi qui.</p>
        </div>
      ) : null}

      <section className="order-grid">
        {orders.map((order) => {
          const status = (order.status || "processing").toLowerCase();
          return (
            <article key={order._id} className="order-card">
              <div className="order-card__head">
                <div className="order-card__field">
                  <small>Numero ordine</small>
                  <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                </div>
                <div className="order-card__field">
                  <small>
                    <CalendarIcon /> Data
                  </small>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
                <div className="order-card__field order-card__total">
                  <small>
                    <ReceiptIcon /> Totale
                  </small>
                  <strong>€ {Number(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
                <span className={`stock-pill ${statusModifier(status)}`}>
                  {STATUS_LABELS[status] || order.status}
                </span>
              </div>

              <hr className="order-card__divider" />

              <div className="order-card__items">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item.product}`} className="order-row">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="order-row__media" />
                    ) : (
                      <div className="order-row__media" aria-hidden="true" />
                    )}
                    <div>
                      <p className="order-row__title">{item.title}</p>
                      <span className="order-row__qty">Quantità: {item.quantity}</span>
                    </div>
                    <span className="order-row__price">
                      € {Number(item.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default OrdersPage;
