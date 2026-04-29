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

export const getSpecificationEntries = (product) => {
  if (!product?.specifications) {
    return [];
  }

  const { details = {}, ...mainSpecs } = product.specifications;
  const baseEntries = Object.entries(mainSpecs).filter(([, value]) => value);
  const detailEntries = Object.entries(details || {}).filter(([, value]) => value);

  return [...baseEntries, ...detailEntries];
};

export const getCompatibilityEntries = (product) =>
  Object.entries(product?.compatibility || {}).filter(([, value]) => value);

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
