import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  title: "",
  description: "",
  priceBase: "",
  markup: "",
  image: "",
  category: "",
};

const fetchDashboardData = async (token) => {
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const [productData, orderData] = await Promise.all([
    apiRequest("/products"),
    apiRequest("/orders", { headers: authHeaders }),
  ]);

  return {
    products: productData,
    orders: orderData,
  };
};

const AdminDashboardPage = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${auth.token}`,
  };

  const dashboardStats = useMemo(
    () => [
      { label: "Prodotti", value: products.length },
      { label: "Ordini", value: orders.length },
      { label: "Pending", value: orders.filter((order) => order.status === "pending").length },
    ],
    [products, orders],
  );

  const loadDashboardData = async () => {
    const data = await fetchDashboardData(auth.token);
    setProducts(data.products);
    setOrders(data.orders);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const data = await fetchDashboardData(auth.token);
        setProducts(data.products);
        setOrders(data.orders);
      } catch (error) {
        setMessage(error.message);
      }
    };

    initializeDashboard();
  }, [auth.token]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/products/${editingId}` : "/products";

      await apiRequest(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          priceBase: Number(form.priceBase),
          markup: Number(form.markup),
        }),
      });

      resetForm();
      setMessage("Prodotto salvato correttamente.");
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      priceBase: product.priceBase,
      markup: product.markup,
      image: product.image,
      category: product.category,
    });
  };

  const handleDelete = async (productId) => {
    try {
      await apiRequest(`/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setMessage("Prodotto eliminato.");
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      setMessage("Stato ordine aggiornato.");
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="stack-2xl">
      <section className="section-head">
        <div>
          <span className="eyebrow">Dashboard admin</span>
          <h1>Gestione prodotti e ordini con layout più chiaro e operativo.</h1>
        </div>
      </section>

      <section className="admin-stat-grid">
        {dashboardStats.map((item) => (
          <article key={item.label} className="metric-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      {message ? <div className="alert alert-info">{message}</div> : null}

      <section className="dashboard-grid">
        <article className="card admin-form-panel">
          <div className="checkout-section-title">
            <h2>{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            <p>La struttura rimane compatibile con il backend esistente.</p>
          </div>

          <form className="row g-3" onSubmit={handleProductSubmit}>
            <div className="col-md-6">
              <label className="form-label">Titolo</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Categoria</label>
              <input
                type="text"
                className="form-control"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Prezzo base</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.priceBase}
                onChange={(event) => setForm({ ...form, priceBase: event.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Markup %</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.markup}
                onChange={(event) => setForm({ ...form, markup: event.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Immagine URL</label>
              <input
                type="url"
                className="form-control"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Descrizione</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </div>
            <div className="col-12 d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-primary btn-premium">
                {editingId ? "Aggiorna prodotto" : "Crea prodotto"}
              </button>
              {editingId ? (
                <button type="button" className="btn btn-outline-secondary btn-premium-outline" onClick={resetForm}>
                  Annulla modifica
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card admin-list-panel">
          <div className="checkout-section-title">
            <h2>Prodotti</h2>
            <p>Vista sintetica dei prodotti già pubblicati.</p>
          </div>

          <div className="stack-sm">
            {products.map((product) => (
              <div key={product._id} className="admin-row">
                <div>
                  <strong>{product.title}</strong>
                  <p>€ {product.finalPrice.toFixed(2)} · {product.category}</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-outline-secondary btn-sm btn-premium-outline" onClick={() => handleEdit(product)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn-primary btn-sm btn-premium" onClick={() => handleDelete(product._id)}>
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card admin-orders-panel">
        <div className="checkout-section-title">
          <h2>Ordini</h2>
          <p>Controllo stato ordini con interazione semplice e leggibile.</p>
        </div>

        <div className="orders-grid">
          {orders.map((order) => (
            <article key={order._id} className="order-card-premium">
              <div className="order-card-premium__header">
                <div>
                  <small>Cliente</small>
                  <strong>{order.user?.name || "Customer"}</strong>
                </div>
                <span className={`status-badge status-badge--${order.status}`}>{order.status}</span>
              </div>
              <p className="text-muted">{order.user?.email}</p>
              <div className="summary-line">
                <span>Totale</span>
                <strong>€ {order.totalAmount.toFixed(2)}</strong>
              </div>
              <select
                className="form-select"
                value={order.status}
                onChange={(event) => handleStatusChange(order._id, event.target.value)}
              >
                <option value="pending">pending</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
              </select>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
