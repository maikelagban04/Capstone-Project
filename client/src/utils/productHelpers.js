export const COMPONENT_TYPES = [
  "CPU",
  "GPU",
  "RAM",
  "SSD",
  "HDD",
  "Motherboard",
  "PSU",
  "Case",
  "Cooling",
  "Monitor",
  "Storage",
  "Accessory",
];

export const formatKeyLabel = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getProductMeta = (product) =>
  [product.componentType, product.brand, product.model].filter(Boolean).join(" · ");

// Mappa componentType → chiave del sotto-oggetto tipizzato in `specifications`.
const TYPE_TO_SPEC_GROUP = {
  CPU: "cpu",
  GPU: "gpu",
  RAM: "ram",
  SSD: "ssd",
  HDD: "ssd",          // riusiamo lo stesso gruppo per gli HDD
  Storage: "ssd",
  PSU: "psu",
  Motherboard: "motherboard",
  Case: "case",
  Cooling: "cooling",
};

// I sotto-gruppi sono campi nidificati di `specifications`: vanno esclusi
// quando si itera sui campi flat condivisi.
const SPEC_GROUP_KEYS = ["cpu", "gpu", "ram", "ssd", "psu", "motherboard", "case", "cooling"];

const isMeaningful = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const formatValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Sì" : "No";
  return String(value);
};

export const getSpecificationEntries = (product) => {
  if (!product?.specifications) return [];

  const { details = {}, ...rest } = product.specifications;

  // 1. Sotto-oggetto tipizzato per il componentType del prodotto
  const groupKey = TYPE_TO_SPEC_GROUP[product.componentType];
  const groupEntries = groupKey && rest[groupKey]
    ? Object.entries(rest[groupKey]).filter(([, value]) => isMeaningful(value))
    : [];

  // 2. Campi flat legacy (cores, frequency, ...) escludendo i sotto-gruppi
  const flatEntries = Object.entries(rest)
    .filter(([key]) => !SPEC_GROUP_KEYS.includes(key))
    .filter(([, value]) => isMeaningful(value));

  // 3. Map "details" libera
  const detailsObj = details instanceof Map ? Object.fromEntries(details) : details || {};
  const detailEntries = Object.entries(detailsObj).filter(([, value]) => isMeaningful(value));

  return [...groupEntries, ...flatEntries, ...detailEntries].map(([key, value]) => [
    key,
    formatValue(value),
  ]);
};

export const getCompatibilityEntries = (product) =>
  Object.entries(product?.compatibility || {})
    .filter(([, value]) => isMeaningful(value))
    .map(([key, value]) => [key, formatValue(value)]);

export const parseJsonInput = (value, fieldName) => {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(`${fieldName} must be valid JSON object`);
  }
};

export const stringifyJsonInput = (value) => JSON.stringify(value || {}, null, 2);
