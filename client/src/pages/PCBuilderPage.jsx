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
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

// Restituisce il primo valore truthy tra una lista di getter.
const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null && v !== "" && v !== 0);

// Wattaggio assorbito stimato di un componente: prende il massimo tra
// tutti i possibili campi (sotto-oggetti tipizzati o flat legacy).
const componentPower = (component) => {
  if (!component) return 0;
  const spec = component.specifications || {};
  const compat = component.compatibility || {};
  return Math.max(
    parseWattage(spec.cpu?.tdpW),
    parseWattage(spec.gpu?.tdpW),
    parseWattage(compat.tdp),
    parseWattage(spec.power),
  );
};

// Wattaggio EROGABILE da un PSU.
const psuOutputWattage = (psu) => {
  if (!psu) return 0;
  return Math.max(
    parseWattage(psu.specifications?.psu?.wattage),
    parseWattage(psu.compatibility?.wattage),
    parseWattage(psu.specifications?.power),
  );
};

// Helper per check case-insensitive su array (es. socket list, form factor).
const includesIgnoreCase = (list, value) => {
  if (!Array.isArray(list) || !value) return false;
  const target = String(value).trim().toLowerCase();
  return list.some((item) => String(item || "").trim().toLowerCase() === target);
};

// Controlli di compatibilità tra gli slot selezionati.
const computeCompatibilityIssues = (build) => {
  const issues = [];
  const cpu = build.CPU;
  const mobo = build.Motherboard;
  const ram = build.RAM;
  const gpu = build.GPU;
  const psu = build.PSU;
  const pcCase = build.Case;
  const cooling = build.Cooling;

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

  // 3. Form factor scheda madre ↔ Case
  if (mobo && pcCase) {
    const moboFormFactor = mobo.compatibility?.formFactor;
    const supportedFormFactors = pcCase.specifications?.case?.formFactorSupport;
    if (moboFormFactor && Array.isArray(supportedFormFactors) && supportedFormFactors.length > 0) {
      if (!includesIgnoreCase(supportedFormFactors, moboFormFactor)) {
        issues.push({
          level: "error",
          message: `Form factor incompatibile: Motherboard ${moboFormFactor} non supportato dal Case (${supportedFormFactors.join(", ")})`,
        });
      }
    }
  }

  // 4. Lunghezza GPU ↔ Case
  if (gpu && pcCase) {
    const gpuLength = pickFirst(gpu.specifications?.gpu?.lengthMm);
    const caseMaxLength = pickFirst(
      pcCase.specifications?.case?.maxGpuLengthMm,
      pcCase.compatibility?.maxGpuLengthMm,
    );
    if (gpuLength && caseMaxLength && gpuLength > caseMaxLength) {
      issues.push({
        level: "error",
        message: `GPU troppo lunga: ${gpuLength}mm > ${caseMaxLength}mm massimi del case`,
      });
    }
  }

  // 5. Cooler ↔ socket CPU
  if (cooling && cpu) {
    const supportedSockets = cooling.specifications?.cooling?.supportedSockets;
    const cpuSocket = cpu.compatibility?.socket;
    if (cpuSocket && Array.isArray(supportedSockets) && supportedSockets.length > 0) {
      if (!includesIgnoreCase(supportedSockets, cpuSocket)) {
        issues.push({
          level: "error",
          message: `Dissipatore non compatibile col socket ${cpuSocket} (supportati: ${supportedSockets.join(", ")})`,
        });
      }
    }
  }

  // 6. Numero moduli RAM ↔ slot della motherboard
  if (ram && mobo) {
    const modules = pickFirst(ram.specifications?.ram?.modulesCount);
    const moboSlots = pickFirst(
      mobo.specifications?.motherboard?.memorySlots,
      mobo.compatibility?.memorySlots,
    );
    if (modules && moboSlots && modules > moboSlots) {
      issues.push({
        level: "error",
        message: `Troppi moduli RAM: ${modules} richiesti, ${moboSlots} slot disponibili sulla motherboard`,
      });
    }
  }

  // 7. Capienza RAM totale ↔ supporto motherboard
  if (ram && mobo) {
    const sizeGb = pickFirst(ram.specifications?.ram?.sizeGb);
    const modules = pickFirst(ram.specifications?.ram?.modulesCount) || 1;
    const totalRam = sizeGb ? sizeGb * modules : 0;
    const maxRam = pickFirst(
      mobo.specifications?.motherboard?.maxMemoryGb,
      mobo.compatibility?.maxMemoryGb,
    );
    if (totalRam && maxRam && totalRam > maxRam) {
      issues.push({
        level: "error",
        message: `RAM totale ${totalRam}GB oltre il massimo supportato dalla motherboard (${maxRam}GB)`,
      });
    }
  }

  // 8. Wattaggio totale ≤ PSU
  // PSU e Case sono esclusi dal consumo: il PSU EROGA potenza
  // (non la consuma) e il case non assorbe wattaggio significativo.
  const POWER_EXCLUDED_SLOTS = new Set(["PSU", "Case"]);
  const totalWatt = Object.entries(build).reduce((sum, [slotKey, component]) => {
    if (!component || POWER_EXCLUDED_SLOTS.has(slotKey)) return sum;
    return sum + componentPower(component);
  }, 0);

  if (psu) {
    const psuWattage = psuOutputWattage(psu);
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

  // 9. PSU consigliato dalla GPU
  if (gpu && psu) {
    const recommendedPsu = pickFirst(gpu.specifications?.gpu?.recommendedPsuW);
    const psuWattage = psuOutputWattage(psu);
    if (recommendedPsu && psuWattage && psuWattage < recommendedPsu) {
      issues.push({
        level: "warning",
        message: `La GPU consiglia un alimentatore da almeno ${recommendedPsu}W (attuale: ${psuWattage}W)`,
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
