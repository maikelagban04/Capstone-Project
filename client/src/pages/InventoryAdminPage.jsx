import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { TrashIcon } from "../components/icons";

const buildDraft = (product) => ({
  priceBase: String(product.priceBase ?? ""),
  markup: String(product.markup ?? ""),
  stock: String(product.stock ?? 0),
  isOnSale: Boolean(product.isOnSale),
  salePrice: product.salePrice != null ? String(product.salePrice) : "",
});

const isDirty = (product, draft) => {
  if (!draft) return false;
  return (
    Number(draft.priceBase) !== Number(product.priceBase) ||
    Number(draft.markup) !== Number(product.markup) ||
    Number(draft.stock) !== Number(product.stock) ||
    Boolean(draft.isOnSale) !== Boolean(product.isOnSale) ||
    String(draft.salePrice || "") !== String(product.salePrice ?? "")
  );
};

const InventoryAdminPage = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${auth.token}` }),
    [auth.token],
  );

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/products");
      setProducts(data);
      setDrafts(
        data.reduce((accumulator, product) => {
          accumulator[product._id] = buildDraft(product);
          return accumulator;
        }, {}),
      );
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const setDraftField = (productId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [productId]: { ...current[productId], [field]: value },
    }));
  };

  const handleSave = async (product) => {
    const draft = drafts[product._id];
    if (!draft) return;

    if (draft.isOnSale) {
      const salePriceNumber = Number(draft.salePrice);
      if (!salePriceNumber || salePriceNumber <= 0) {
        setFeedback({
          type: "error",
          message: `Indica un prezzo scontato valido per "${product.title}".`,
        });
        return;
      }
    }

    try {
      setSavingId(product._id);
      const updated = await apiRequest(`/products/${product._id}/inventory`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          priceBase: Number(draft.priceBase),
          markup: Number(draft.markup),
          stock: Number(draft.stock),
          isOnSale: draft.isOnSale,
          salePrice: draft.isOnSale ? Number(draft.salePrice) : null,
        }),
      });
      setProducts((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated._id]: buildDraft(updated),
      }));
      setFeedback({ type: "success", message: `"${updated.title}" aggiornato.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSavingId("");
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Eliminare definitivamente "${product.title}"?`)) return;

    try {
      setDeletingId(product._id);
      await apiRequest(`/products/${product._id}`, {
        method: "DELETE",
        headers,
      });
      setProducts((current) => current.filter((item) => item._id !== product._id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[product._id];
        return next;
      });
      setFeedback({ type: "success", message: `"${product.title}" eliminato.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setDeletingId("");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.title, product.brand, product.componentType, product.model]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const outOfStock = products.filter((product) => !product.inStock).length;
    const onSale = products.filter((product) => product.isOnSale).length;
    return { total: products.length, outOfStock, onSale };
  }, [products]);

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Super admin</span>
          <h1>Gestione inventario</h1>
        </div>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <small>Prodotti totali</small>
          <strong>{stats.total}</strong>
        </article>
        <article className="info-card">
          <small>In sconto</small>
          <strong>{stats.onSale}</strong>
        </article>
        <article className="info-card">
          <small>Out of stock</small>
          <strong>{stats.outOfStock}</strong>
        </article>
      </section>

      <div className="catalog-toolbar">
        <input
          type="search"
          className="form-control"
          placeholder="Cerca per titolo, brand, modello..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: 360 }}
        />
        <span>{filtered.length} risultati</span>
      </div>

      {feedback.message ? (
        <div className={`alert ${feedback.type === "error" ? "alert-danger" : "alert-info"}`}>
          {feedback.message}
        </div>
      ) : null}

      {loading ? <div className="empty-panel">Caricamento inventario...</div> : null}
      {!loading && filtered.length === 0 ? (
        <div className="empty-panel">
          <strong>Nessun prodotto.</strong>
          <p>Modifica la ricerca o aggiungine uno dalla dashboard admin.</p>
        </div>
      ) : null}

      <section className="inventory-grid">
        {filtered.map((product) => {
          const draft = drafts[product._id] || buildDraft(product);
          const dirty = isDirty(product, draft);
          const outOfStock = !product.inStock;

          return (
            <article
              key={product._id}
              className={`inventory-card ${outOfStock ? "is-out-of-stock" : ""} ${product.isOnSale ? "is-on-sale" : ""}`}
            >
              <div className="inventory-card__media">
                <img src={product.image} alt={product.title} />
                {outOfStock ? <span className="inventory-card__overlay">OUT OF STOCK</span> : null}
                {product.isOnSale ? <span className="inventory-card__sale">IN SCONTO</span> : null}
              </div>

              <div className="inventory-card__body">
                <div className="inventory-card__head">
                  <p className="product-card__category">
                    {product.componentType} · {product.brand}
                  </p>
                  <h3>{product.title}</h3>
                </div>

                <div className="inventory-grid__fields">
                  <label className="inventory-field">
                    <span>Prezzo base (€)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={draft.priceBase}
                      onChange={(event) =>
                        setDraftField(product._id, "priceBase", event.target.value)
                      }
                    />
                  </label>
                  <label className="inventory-field">
                    <span>Markup (%)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={draft.markup}
                      onChange={(event) =>
                        setDraftField(product._id, "markup", event.target.value)
                      }
                    />
                  </label>
                  <label className="inventory-field">
                    <span>Stock</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={draft.stock}
                      onChange={(event) =>
                        setDraftField(product._id, "stock", event.target.value)
                      }
                    />
                  </label>
                  <div className="inventory-field">
                    <span>Prezzo finale calcolato</span>
                    <strong>€ {Number(product.finalPrice).toFixed(2)}</strong>
                  </div>
                </div>

                <label className="inventory-toggle">
                  <input
                    type="checkbox"
                    checked={draft.isOnSale}
                    onChange={(event) =>
                      setDraftField(product._id, "isOnSale", event.target.checked)
                    }
                  />
                  <span>Pin come "in sconto"</span>
                </label>

                {draft.isOnSale ? (
                  <label className="inventory-field">
                    <span>Prezzo scontato (€)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={draft.salePrice}
                      placeholder={`Inferiore a ${Number(product.finalPrice).toFixed(2)}`}
                      onChange={(event) =>
                        setDraftField(product._id, "salePrice", event.target.value)
                      }
                    />
                  </label>
                ) : null}

                <div className="inventory-card__actions">
                  <button
                    type="button"
                    className="btn-shell btn-shell--primary"
                    onClick={() => handleSave(product)}
                    disabled={!dirty || savingId === product._id}
                  >
                    {savingId === product._id ? "Salvataggio..." : "Salva"}
                  </button>
                  <button
                    type="button"
                    className="btn-shell"
                    onClick={() =>
                      setDrafts((current) => ({
                        ...current,
                        [product._id]: buildDraft(product),
                      }))
                    }
                    disabled={!dirty}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn-shell inventory-card__delete"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product._id}
                    aria-label={`Elimina ${product.title}`}
                    title="Elimina prodotto"
                  >
                    <TrashIcon />
                    <span>{deletingId === product._id ? "..." : "Elimina"}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default InventoryAdminPage;
