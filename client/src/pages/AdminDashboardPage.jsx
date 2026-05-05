import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { COMPONENT_TYPES } from "../utils/productHelpers";
import {
  COMPATIBILITY_FIELDS,
  SPEC_GROUP_FIELDS,
  TYPE_TO_SPEC_GROUP,
  formatFieldValue,
  parseFieldValue,
} from "../utils/productFormSchema";

const emptyForm = {
  // Campi universali
  title: "",
  description: "",
  shortDescription: "",
  highlightsText: "", // textarea multilinea → array
  priceBase: "",
  markup: "",
  image: "",
  imagesText: "",    // textarea multilinea → array
  category: "",
  componentType: "",
  brand: "",
  model: "",
  releaseYear: "",
  warrantyMonths: "",
  weightGrams: "",
  color: "",
  dimLength: "",
  dimWidth: "",
  dimHeight: "",
  stock: "0",
  isOnSale: false,
  salePrice: "",
  // Gruppi dinamici: specs[groupKey][fieldKey] e compat[fieldKey]
  specs: {},       // { cpu: { coresCount: "16", ... }, gpu: {...}, ... }
  compat: {},      // { socket: "AM5", ... }
};

// Trasforma un array da modello in testo multilinea.
const toMultiline = (value) => (Array.isArray(value) ? value.filter(Boolean).join("\n") : "");
const fromMultiline = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

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

  const buildSpecsPayload = (currentForm) => {
    const groupKey = TYPE_TO_SPEC_GROUP[currentForm.componentType];
    const out = {};

    if (groupKey) {
      const fields = SPEC_GROUP_FIELDS[groupKey] || [];
      const groupValues = {};
      fields.forEach((field) => {
        const rawValue = currentForm.specs?.[groupKey]?.[field.key];
        const parsed = parseFieldValue(field, rawValue);
        if (parsed !== undefined && parsed !== "" && !(Array.isArray(parsed) && parsed.length === 0)) {
          groupValues[field.key] = parsed;
        }
      });
      if (Object.keys(groupValues).length > 0) {
        out[groupKey] = groupValues;
      }
    }

    return out;
  };

  const buildCompatPayload = (currentForm) => {
    const out = {};
    COMPATIBILITY_FIELDS.forEach((field) => {
      const rawValue = currentForm.compat?.[field.key];
      const parsed = parseFieldValue(field, rawValue);
      if (parsed !== undefined && parsed !== "") {
        out[field.key] = parsed;
      }
    });
    return out;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const dimensions = {};
      if (form.dimLength) dimensions.length = Number(form.dimLength);
      if (form.dimWidth) dimensions.width = Number(form.dimWidth);
      if (form.dimHeight) dimensions.height = Number(form.dimHeight);

      const payload = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        highlights: fromMultiline(form.highlightsText),
        priceBase: Number(form.priceBase),
        markup: Number(form.markup),
        image: form.image,
        images: fromMultiline(form.imagesText),
        category: form.category,
        componentType: form.componentType,
        brand: form.brand,
        model: form.model,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        warrantyMonths: form.warrantyMonths ? Number(form.warrantyMonths) : undefined,
        weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
        color: form.color || undefined,
        dimensionsMm: Object.keys(dimensions).length ? dimensions : undefined,
        stock: Number(form.stock),
        isOnSale: Boolean(form.isOnSale),
        salePrice:
          form.isOnSale && form.salePrice !== "" ? Number(form.salePrice) : null,
        specifications: buildSpecsPayload(form),
        compatibility: buildCompatPayload(form),
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

    // Popola i gruppi dinamici con i valori esistenti, formattati per il form.
    const groupKey = TYPE_TO_SPEC_GROUP[product.componentType];
    const specsState = {};
    if (groupKey && product.specifications?.[groupKey]) {
      const fields = SPEC_GROUP_FIELDS[groupKey] || [];
      specsState[groupKey] = {};
      fields.forEach((field) => {
        specsState[groupKey][field.key] = formatFieldValue(
          field,
          product.specifications[groupKey][field.key],
        );
      });
    }

    const compatState = {};
    COMPATIBILITY_FIELDS.forEach((field) => {
      compatState[field.key] = formatFieldValue(field, product.compatibility?.[field.key]);
    });

    setForm({
      title: product.title || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      highlightsText: toMultiline(product.highlights),
      priceBase: String(product.priceBase ?? ""),
      markup: String(product.markup ?? ""),
      image: product.image || "",
      imagesText: toMultiline(product.images),
      category: product.category || "",
      componentType: product.componentType || "",
      brand: product.brand || "",
      model: product.model || "",
      releaseYear: product.releaseYear ? String(product.releaseYear) : "",
      warrantyMonths: product.warrantyMonths ? String(product.warrantyMonths) : "",
      weightGrams: product.weightGrams ? String(product.weightGrams) : "",
      color: product.color || "",
      dimLength: product.dimensionsMm?.length ? String(product.dimensionsMm.length) : "",
      dimWidth: product.dimensionsMm?.width ? String(product.dimensionsMm.width) : "",
      dimHeight: product.dimensionsMm?.height ? String(product.dimensionsMm.height) : "",
      stock: String(product.stock ?? 0),
      isOnSale: Boolean(product.isOnSale),
      salePrice: product.salePrice != null ? String(product.salePrice) : "",
      specs: specsState,
      compat: compatState,
    });

    // Scrolla in cima al form
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <h1>Dashboard</h1>
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
        <form className="admin-card admin-form" onSubmit={handleSubmit}>
          <div className="section-head">
            <div>
              <span className="section-kicker">Prodotto</span>
              <h2>{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
            </div>
            {editingId ? (
              <button type="button" className="btn-shell" onClick={resetForm}>
                Annulla modifica
              </button>
            ) : null}
          </div>

          {/* Sezione 1: Anagrafica --------------------------------------- */}
          <fieldset className="admin-form__group">
            <legend>Anagrafica</legend>
            <div className="admin-form__grid">
              <label className="admin-form__field admin-form__field--wide">
                <span>Titolo</span>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field">
                <span>Tipo componente</span>
                <select
                  className="form-select"
                  value={form.componentType}
                  onChange={(event) =>
                    setForm({ ...form, componentType: event.target.value, specs: {} })
                  }
                  required
                >
                  <option value="">Seleziona...</option>
                  {COMPONENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="admin-form__field">
                <span>Categoria</span>
                <input
                  className="form-control"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field">
                <span>Brand</span>
                <input
                  className="form-control"
                  value={form.brand}
                  onChange={(event) => setForm({ ...form, brand: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field">
                <span>Model</span>
                <input
                  className="form-control"
                  value={form.model}
                  onChange={(event) => setForm({ ...form, model: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field admin-form__field--wide">
                <span>Descrizione breve (marketing, max 200 car.)</span>
                <input
                  className="form-control"
                  maxLength={200}
                  value={form.shortDescription}
                  onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
                  placeholder="Una frase d'effetto che appare in cima al dettaglio"
                />
              </label>
              <label className="admin-form__field admin-form__field--wide">
                <span>Descrizione completa</span>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field admin-form__field--wide">
                <span>Highlights (uno per riga)</span>
                <textarea
                  className="form-control"
                  rows={4}
                  value={form.highlightsText}
                  onChange={(event) => setForm({ ...form, highlightsText: event.target.value })}
                  placeholder={"24 core / 32 thread\nBoost fino a 6.0 GHz\nCache L3 da 36 MB"}
                />
              </label>
            </div>
          </fieldset>

          {/* Sezione 2: Immagini --------------------------------------- */}
          <fieldset className="admin-form__group">
            <legend>Immagini</legend>
            <div className="admin-form__grid">
              <label className="admin-form__field admin-form__field--wide">
                <span>Immagine copertina (URL)</span>
                <input
                  type="url"
                  className="form-control"
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field admin-form__field--wide">
                <span>Galleria — URL aggiuntivi (uno per riga)</span>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.imagesText}
                  onChange={(event) => setForm({ ...form, imagesText: event.target.value })}
                  placeholder="https://res.cloudinary.com/.../img1.jpg"
                />
              </label>
            </div>
          </fieldset>

          {/* Sezione 3: Prezzo & stock --------------------------------------- */}
          <fieldset className="admin-form__group">
            <legend>Prezzo & disponibilità</legend>
            <div className="admin-form__grid">
              <label className="admin-form__field">
                <span>Prezzo base (€)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.priceBase}
                  onChange={(event) => setForm({ ...form, priceBase: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field">
                <span>Markup (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.markup}
                  onChange={(event) => setForm({ ...form, markup: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field">
                <span>Stock</span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  required
                />
              </label>
              <label className="admin-form__field admin-form__field--checkbox">
                <input
                  type="checkbox"
                  checked={form.isOnSale}
                  onChange={(event) => setForm({ ...form, isOnSale: event.target.checked })}
                />
                <span>In sconto</span>
              </label>
              <label className="admin-form__field">
                <span>Prezzo scontato (€)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.salePrice}
                  onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
                  disabled={!form.isOnSale}
                />
              </label>
            </div>
          </fieldset>

          {/* Sezione 4: Info prodotto --------------------------------------- */}
          <fieldset className="admin-form__group">
            <legend>Info prodotto</legend>
            <div className="admin-form__grid">
              <label className="admin-form__field">
                <span>Anno rilascio</span>
                <input
                  type="number"
                  className="form-control"
                  value={form.releaseYear}
                  onChange={(event) => setForm({ ...form, releaseYear: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Garanzia (mesi)</span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.warrantyMonths}
                  onChange={(event) => setForm({ ...form, warrantyMonths: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Peso (g)</span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.weightGrams}
                  onChange={(event) => setForm({ ...form, weightGrams: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Colore</span>
                <input
                  className="form-control"
                  value={form.color}
                  onChange={(event) => setForm({ ...form, color: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Lunghezza (mm)</span>
                <input
                  type="number"
                  className="form-control"
                  value={form.dimLength}
                  onChange={(event) => setForm({ ...form, dimLength: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Larghezza (mm)</span>
                <input
                  type="number"
                  className="form-control"
                  value={form.dimWidth}
                  onChange={(event) => setForm({ ...form, dimWidth: event.target.value })}
                />
              </label>
              <label className="admin-form__field">
                <span>Altezza (mm)</span>
                <input
                  type="number"
                  className="form-control"
                  value={form.dimHeight}
                  onChange={(event) => setForm({ ...form, dimHeight: event.target.value })}
                />
              </label>
            </div>
          </fieldset>

          {/* Sezione 5: Specifiche tipizzate (dinamica) --------------------- */}
          {form.componentType && TYPE_TO_SPEC_GROUP[form.componentType] ? (
            <fieldset className="admin-form__group">
              <legend>
                Specifiche {form.componentType}
              </legend>
              <div className="admin-form__grid">
                {(SPEC_GROUP_FIELDS[TYPE_TO_SPEC_GROUP[form.componentType]] || []).map((field) => {
                  const groupKey = TYPE_TO_SPEC_GROUP[form.componentType];
                  const value = form.specs?.[groupKey]?.[field.key] ?? (field.type === "boolean" ? false : "");
                  const onChange = (newValue) =>
                    setForm((prev) => ({
                      ...prev,
                      specs: {
                        ...prev.specs,
                        [groupKey]: { ...(prev.specs[groupKey] || {}), [field.key]: newValue },
                      },
                    }));

                  const fieldClass = field.type === "array" || field.type === "boolean"
                    ? "admin-form__field admin-form__field--wide"
                    : "admin-form__field";

                  if (field.type === "boolean") {
                    return (
                      <label key={field.key} className="admin-form__field admin-form__field--checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => onChange(event.target.checked)}
                        />
                        <span>{field.label}</span>
                      </label>
                    );
                  }

                  if (field.type === "array") {
                    return (
                      <label key={field.key} className={fieldClass}>
                        <span>{field.label}</span>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        />
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <label key={field.key} className={fieldClass}>
                        <span>{field.label}</span>
                        <select
                          className="form-select"
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        >
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt || "—"}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  return (
                    <label key={field.key} className={fieldClass}>
                      <span>{field.label}</span>
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        step={field.step}
                        className="form-control"
                        placeholder={field.placeholder || ""}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {/* Sezione 6: Compatibilità --------------------- */}
          <fieldset className="admin-form__group">
            <legend>Compatibilità (per check PC Builder)</legend>
            <div className="admin-form__grid">
              {COMPATIBILITY_FIELDS.map((field) => {
                const value = form.compat?.[field.key] ?? "";
                const onChange = (newValue) =>
                  setForm((prev) => ({
                    ...prev,
                    compat: { ...prev.compat, [field.key]: newValue },
                  }));

                if (field.type === "select") {
                  return (
                    <label key={field.key} className="admin-form__field">
                      <span>{field.label}</span>
                      <select
                        className="form-select"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || "—"}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                return (
                  <label key={field.key} className="admin-form__field">
                    <span>{field.label}</span>
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      className="form-control"
                      placeholder={field.placeholder || ""}
                      value={value}
                      onChange={(event) => onChange(event.target.value)}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="admin-card__actions">
            <button type="submit" className="btn btn-primary btn-shell btn-shell--primary">
              {editingId ? "Aggiorna prodotto" : "Crea prodotto"}
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
