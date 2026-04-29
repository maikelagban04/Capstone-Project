import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { COMPONENT_TYPES, parseJsonInput, stringifyJsonInput } from "../utils/productHelpers";

const emptyForm = {
  title: "",
  description: "",
  priceBase: "",
  markup: "",
  image: "",
  category: "",
  componentType: "",
  brand: "",
  model: "",
  stock: "0",
  specificationsJson: "{}",
  compatibilityJson: "{}",
};

const fetchDashboardData = async (token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [productData, orderData] = await Promise.all([
    apiRequest("/products"),
    apiRequest("/orders", { headers }),
  ]);

  return { products: productData, orders: orderData };
};

const AdminDashboardPage = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const headers = {
    Authorization: `Bearer ${auth.token}`,
  };

  const stats = useMemo(
    () => [
      { label: "Prodotti", value: products.length },
      { label: "Ordini", value: orders.length },
      { label: "Pending", value: orders.filter((order) => order.status === "pending").length },
    ],
    [products, orders],
  );

  const loadDashboard = useCallback(async () => {
    const data = await fetchDashboardData(auth.token);
    setProducts(data.products);
    setOrders(data.orders);
  }, [auth.token]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadDashboard();
      } catch (requestError) {
        setMessage(requestError.message);
      }
    };

    initialize();
  }, [loadDashboard]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        title: form.title,
        description: form.description,
        priceBase: Number(form.priceBase),
        markup: Number(form.markup),
        image: form.image,
        category: form.category,
        componentType: form.componentType,
        brand: form.brand,
        model: form.model,
        stock: Number(form.stock),
        specifications: parseJsonInput(form.specificationsJson, "Specifications"),
        compatibility: parseJsonInput(form.compatibilityJson, "Compatibility"),
      };

      await apiRequest(editingId ? `/products/${editingId}` : "/products", {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      setMessage(editingId ? "Prodotto aggiornato." : "Prodotto creato.");
      resetForm();
      await loadDashboard();
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      priceBase: String(product.priceBase),
      markup: String(product.markup),
      image: product.image,
      category: product.category,
      componentType: product.componentType,
      brand: product.brand,
      model: product.model,
      stock: String(product.stock ?? 0),
      specificationsJson: stringifyJsonInput(product.specifications),
      compatibilityJson: stringifyJsonInput(product.compatibility),
    });
  };

  const handleDelete = async (productId) => {
    try {
      await apiRequest(`/products/${productId}`, {
        method: "DELETE",
        headers,
      });
      setMessage("Prodotto eliminato.");
      await loadDashboard();
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      await loadDashboard();
      setMessage("Stato ordine aggiornato.");
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Admin</span>
          <h1>Dashboard coerente con il model del database.</h1>
        </div>
      </section>

      <section className="info-card-grid">
        {stats.map((item) => (
          <article key={item.label} className="info-card">
            <small>{item.label}</small>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      {message ? <div className="alert alert-info">{message}</div> : null}

      <section className="admin-layout">
        <form className="admin-card" onSubmit={handleSubmit}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Prodotto</span>
              <h2>{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Titolo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Categoria" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={form.componentType} onChange={(event) => setForm({ ...form, componentType: event.target.value })} required>
                <option value="">Tipo componente</option>
                {COMPONENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="Model" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} required />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" placeholder="Prezzo base" value={form.priceBase} onChange={(event) => setForm({ ...form, priceBase: event.target.value })} required />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" placeholder="Markup" value={form.markup} onChange={(event) => setForm({ ...form, markup: event.target.value })} required />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
            </div>
            <div className="col-12">
              <input type="url" className="form-control" placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
            </div>
            <div className="col-12">
              <textarea className="form-control" placeholder="Descrizione" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </div>
            <div className="col-md-6">
              <textarea
                className="form-control"
                placeholder='Specifications JSON, es: {"cores":"8","frequency":"5.0 GHz"}'
                value={form.specificationsJson}
                onChange={(event) => setForm({ ...form, specificationsJson: event.target.value })}
              />
            </div>
            <div className="col-md-6">
              <textarea
                className="form-control"
                placeholder='Compatibility JSON, es: {"socket":"AM5","memoryType":"DDR5"}'
                value={form.compatibilityJson}
                onChange={(event) => setForm({ ...form, compatibilityJson: event.target.value })}
              />
            </div>
          </div>

          <div className="admin-card__actions">
            <button type="submit" className="btn btn-primary btn-shell btn-shell--primary">
              {editingId ? "Aggiorna" : "Crea"}
            </button>
            {editingId ? (
              <button type="button" className="btn btn-outline-secondary btn-shell" onClick={resetForm}>
                Annulla
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Catalogo</span>
              <h2>Prodotti</h2>
            </div>
          </div>

          <div className="admin-list">
            {products.map((product) => (
              <article key={product._id} className="admin-list__item">
                <div>
                  <strong>{product.title}</strong>
                  <p>{product.componentType} · {product.brand} · € {product.finalPrice.toFixed(2)}</p>
                </div>
                <div className="admin-list__actions">
                  <button type="button" className="btn btn-outline-secondary btn-shell" onClick={() => handleEdit(product)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-shell" onClick={() => handleDelete(product._id)}>
                    Elimina
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-head">
          <div>
            <span className="section-kicker">Ordini</span>
            <h2>Gestione ordini</h2>
          </div>
        </div>

        <div className="order-grid">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-card__head">
                <strong>{order.user?.name || "Customer"}</strong>
                <span>{order.user?.email}</span>
              </div>
              <p>Totale: € {order.totalAmount.toFixed(2)}</p>
              <select className="form-select" value={order.status} onChange={(event) => handleStatusChange(order._id, event.target.value)}>
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
