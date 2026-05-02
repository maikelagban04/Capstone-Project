import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";
import { AlertIcon, CheckIcon, CpuIcon, ZapIcon } from "../components/icons";

// Slot del PC Builder mappati al campo Product.componentType del backend.
// Per ogni slot accettiamo uno o più componentType così da essere flessibili
// (es. "Storage" include anche SSD/HDD).
const SLOTS = [
  { key: "CPU", label: "Processore", icon: "🎯", types: ["CPU"] },
  { key: "Motherboard", label: "Scheda madre", icon: "🔧", types: ["Motherboard"] },
  { key: "GPU", label: "Scheda video", icon: "🎮", types: ["GPU"] },
  { key: "RAM", label: "Memoria RAM", icon: "💾", types: ["RAM"] },
  { key: "Storage", label: "Archiviazione", icon: "💿", types: ["SSD", "HDD", "Storage"] },
  { key: "PSU", label: "Alimentatore", icon: "🔌", types: ["PSU"] },
  { key: "Cooling", label: "Raffreddamento", icon: "❄️", types: ["Cooling"] },
  { key: "Case", label: "Case", icon: "📦", types: ["Case"] },
];

// Estrae un numero dal testo delle spec (es. "170W TDP" → 170).
const parseWattage = (value) => {
  if (!value) return 0;
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

// Controlli di compatibilità tra gli slot selezionati.
const computeCompatibilityIssues = (build) => {
  const issues = [];
  const cpu = build.CPU;
  const mobo = build.Motherboard;
  const ram = build.RAM;
  const psu = build.PSU;

  // 1. Socket CPU ↔ Motherboard
  if (cpu && mobo) {
    const cpuSocket = (cpu.compatibility?.socket || "").trim().toLowerCase();
    const moboSocket = (mobo.compatibility?.socket || "").trim().toLowerCase();
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        level: "error",
        message: `Socket incompatibile: CPU ${cpu.compatibility.socket} vs Motherboard ${mobo.compatibility.socket}`,
      });
    }
  }

  // 2. Memoria RAM ↔ Motherboard (DDR4/DDR5)
  if (ram && mobo) {
    const ramType = (ram.compatibility?.memoryType || "").trim().toLowerCase();
    const moboMemoryType = (mobo.compatibility?.memoryType || "").trim().toLowerCase();
    if (ramType && moboMemoryType && ramType !== moboMemoryType) {
      issues.push({
        level: "error",
        message: `Memoria incompatibile: RAM ${ram.compatibility.memoryType} vs Motherboard ${mobo.compatibility.memoryType}`,
      });
    }
  }

  // 3. Wattaggio totale ≤ PSU
  const totalWatt = Object.values(build).reduce((sum, component) => {
    if (!component) return sum;
    const tdp = parseWattage(component.compatibility?.tdp);
    const power = parseWattage(component.specifications?.power);
    return sum + Math.max(tdp, power);
  }, 0);

  if (psu) {
    const psuWattage = parseWattage(psu.compatibility?.wattage) || parseWattage(psu.specifications?.power);
    if (psuWattage > 0 && totalWatt > psuWattage * 0.85) {
      issues.push({
        level: totalWatt > psuWattage ? "error" : "warning",
        message:
          totalWatt > psuWattage
            ? `Alimentatore insufficiente: richiesti ${totalWatt}W, disponibili ${psuWattage}W`
            : `Alimentatore al limite: consumo stimato ${totalWatt}W su ${psuWattage}W (margine < 15%)`,
      });
    }
  }

  return { issues, totalWatt };
};

const PCBuilderPage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [build, setBuild] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiRequest("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const productsBySlot = useMemo(() => {
    const map = {};
    SLOTS.forEach((slot) => {
      map[slot.key] = products.filter((product) =>
        slot.types.includes(product.componentType),
      );
    });
    return map;
  }, [products]);

  const { issues, totalWatt } = useMemo(() => computeCompatibilityIssues(build), [build]);

  const totalPrice = useMemo(
    () =>
      Object.values(build).reduce((sum, component) => {
        if (!component) return sum;
        const unit = component.isOnSale && component.salePrice
          ? component.salePrice
          : component.finalPrice;
        return sum + Number(unit || 0);
      }, 0),
    [build],
  );

  const selectedCount = Object.values(build).filter(Boolean).length;
  const hasErrors = issues.some((issue) => issue.level === "error");

  const pickComponent = useCallback((slotKey, product) => {
    setBuild((prev) => ({ ...prev, [slotKey]: product }));
    setActiveSlot(null);
    setMessage("");
  }, []);

  const clearSlot = useCallback((slotKey) => {
    setBuild((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  }, []);

  const handleAddAllToCart = () => {
    Object.values(build).forEach((component) => {
      if (!component) return;
      const displayPrice = component.isOnSale && component.salePrice
        ? component.salePrice
        : component.finalPrice;
      addToCart({ ...component, finalPrice: displayPrice });
    });
    setMessage(`${selectedCount} componenti aggiunti al carrello.`);
  };

  if (loading) {
    return <div className="empty-panel">Caricamento catalogo...</div>;
  }

  return (
    <div className="page-stack pc-builder">
      <section className="section-head">
        <div>
          <span className="section-kicker">
            <CpuIcon /> PC Builder
          </span>
          <h1>Configura la tua build</h1>
          <p className="section-subtitle">
            Scegli i componenti dal nostro catalogo. Controlliamo automaticamente la compatibilità
            tra socket, memoria e wattaggio.
          </p>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <div className="alert alert-info">{message}</div> : null}

      <div className="pc-builder__layout">
        <section className="pc-builder__slots">
          {SLOTS.map((slot) => {
            const selected = build[slot.key];
            const count = productsBySlot[slot.key]?.length || 0;
            const isExpanded = activeSlot === slot.key;
            return (
              <article key={slot.key} className={`pc-builder__slot ${selected ? "is-filled" : ""}`}>
                <header className="pc-builder__slot-head">
                  <div className="pc-builder__slot-title">
                    <span className="pc-builder__slot-icon" aria-hidden="true">
                      {slot.icon}
                    </span>
                    <div>
                      <strong>{slot.label}</strong>
                      <small>{count} prodotti disponibili</small>
                    </div>
                  </div>
                  {selected ? (
                    <button
                      type="button"
                      className="btn-shell"
                      onClick={() => clearSlot(slot.key)}
                    >
                      Rimuovi
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-shell btn-shell--primary"
                      onClick={() => setActiveSlot(isExpanded ? null : slot.key)}
                      disabled={count === 0}
                    >
                      {count === 0 ? "Non disponibile" : isExpanded ? "Chiudi" : "Scegli"}
                    </button>
                  )}
                </header>

                {selected ? (
                  <div className="pc-builder__selected">
                    <img src={selected.image} alt={selected.title} />
                    <div>
                      <p className="pc-builder__selected-title">{selected.title}</p>
                      <p className="pc-builder__selected-brand">{selected.brand}</p>
                      <strong>
                        €{" "}
                        {(selected.isOnSale && selected.salePrice
                          ? selected.salePrice
                          : selected.finalPrice
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ) : null}

                {isExpanded ? (
                  <div className="pc-builder__options">
                    {productsBySlot[slot.key]?.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        className="pc-builder__option"
                        onClick={() => pickComponent(slot.key, product)}
                        disabled={!product.inStock}
                      >
                        <img src={product.image} alt={product.title} />
                        <div className="pc-builder__option-info">
                          <strong>{product.title}</strong>
                          <span>{product.brand}</span>
                          {product.compatibility?.socket ? (
                            <small>Socket: {product.compatibility.socket}</small>
                          ) : null}
                          {product.compatibility?.memoryType ? (
                            <small>Memoria: {product.compatibility.memoryType}</small>
                          ) : null}
                          {product.compatibility?.wattage ? (
                            <small>Wattaggio: {product.compatibility.wattage}</small>
                          ) : null}
                        </div>
                        <span className="pc-builder__option-price">
                          €{" "}
                          {(product.isOnSale && product.salePrice
                            ? product.salePrice
                            : product.finalPrice
                          ).toFixed(2)}
                        </span>
                      </button>
                    ))}
                    {productsBySlot[slot.key]?.length === 0 ? (
                      <div className="empty-panel">Nessun prodotto in questa categoria.</div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        <aside className="pc-builder__summary">
          <h3>
            <ZapIcon /> Riepilogo build
          </h3>

          <dl className="pc-builder__summary-stats">
            <div>
              <dt>Componenti</dt>
              <dd>
                {selectedCount} / {SLOTS.length}
              </dd>
            </div>
            <div>
              <dt>Consumo stimato</dt>
              <dd>{totalWatt} W</dd>
            </div>
            <div>
              <dt>Totale</dt>
              <dd>€ {totalPrice.toFixed(2)}</dd>
            </div>
          </dl>

          {issues.length === 0 && selectedCount > 0 ? (
            <div className="pc-builder__status is-ok">
              <CheckIcon /> Tutti i componenti sono compatibili.
            </div>
          ) : null}

          {issues.map((issue, index) => (
            <div
              key={index}
              className={`pc-builder__status ${issue.level === "error" ? "is-error" : "is-warning"}`}
            >
              <AlertIcon />
              <span>{issue.message}</span>
            </div>
          ))}

          <button
            type="button"
            className="btn-shell btn-shell--primary btn-shell--block"
            onClick={handleAddAllToCart}
            disabled={selectedCount === 0 || hasErrors}
          >
            {hasErrors
              ? "Risolvi i conflitti per continuare"
              : `Aggiungi ${selectedCount} al carrello`}
          </button>

          <Link to="/catalog" className="btn-shell btn-shell--block">
            Esplora il catalogo completo
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default PCBuilderPage;
