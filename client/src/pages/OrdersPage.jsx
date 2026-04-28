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
    <div className="stack-lg">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Orders</span>
          <h1>Your order history</h1>
        </div>
      </div>

      {loading ? <p>Loading orders...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="stack-md">
        {orders.map((order) => (
          <article key={order._id} className="card stack-sm">
            <div className="split-row">
              <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
              <span className="pill">{order.status}</span>
            </div>
            <p>Total: EUR {order.totalAmount.toFixed(2)}</p>
            <div className="stack-xs">
              {order.items.map((item) => (
                <div key={`${order._id}-${item.product}`} className="split-row">
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <strong>EUR {item.subtotal.toFixed(2)}</strong>
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
