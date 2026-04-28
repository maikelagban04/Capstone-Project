import { useEffect, useState } from "react";
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
      setMessage("Product saved successfully.");
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
      setMessage("Product deleted successfully.");
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
      setMessage("Order status updated.");
      await loadDashboardData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="admin-layout">
      <section className="card stack-md">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Product management</h1>
          </div>
        </div>
        {message ? <p className="error-text">{message}</p> : null}

        <form className="form-grid" onSubmit={handleProductSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Base price"
            value={form.priceBase}
            onChange={(event) => setForm({ ...form, priceBase: event.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Markup %"
            value={form.markup}
            onChange={(event) => setForm({ ...form, markup: event.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Image URL"
            value={form.image}
            onChange={(event) => setForm({ ...form, image: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <div className="button-row">
            <button type="submit" className="button">
              {editingId ? "Update product" : "Create product"}
            </button>
            {editingId ? (
              <button type="button" className="button button--ghost" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="stack-sm">
          {products.map((product) => (
            <article key={product._id} className="card split-card">
              <div>
                <strong>{product.title}</strong>
                <p>
                  EUR {product.finalPrice.toFixed(2)} | {product.category}
                </p>
              </div>
              <div className="button-row">
                <button type="button" className="button button--ghost" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button type="button" className="button" onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card stack-md">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Operations</span>
            <h2>Order management</h2>
          </div>
        </div>

        <div className="stack-sm">
          {orders.map((order) => (
            <article key={order._id} className="card stack-sm">
              <div className="split-row">
                <strong>{order.user?.name || "Customer"}</strong>
                <span className="pill">{order.status}</span>
              </div>
              <p>{order.user?.email}</p>
              <p>Total: EUR {order.totalAmount.toFixed(2)}</p>
              <select
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
