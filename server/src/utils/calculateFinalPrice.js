export const calculateFinalPrice = (priceBase, markup) => {
  const base = Number(priceBase) || 0;
  const percentage = Number(markup) || 0;

  return Number((base + (base * percentage) / 100).toFixed(2));
};
