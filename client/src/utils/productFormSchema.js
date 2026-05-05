// Descrizione dei campi per ciascun sotto-oggetto `specifications.*` tipizzato.
// Usato dal form admin per renderizzare solo i campi rilevanti al componentType
// selezionato. Ogni campo ha: `key`, `label`, `type` ("text"|"number"|"boolean"|"array"|"select"),
// opzionalmente `options` (per select), `placeholder`, `step` (per number).

export const SPEC_GROUP_FIELDS = {
  cpu: [
    { key: "architecture", label: "Architettura", type: "text", placeholder: "Zen 4, Raptor Lake" },
    { key: "coresCount", label: "Core", type: "number" },
    { key: "threadsCount", label: "Thread", type: "number" },
    { key: "baseClockGhz", label: "Clock base (GHz)", type: "number", step: 0.1 },
    { key: "boostClockGhz", label: "Clock boost (GHz)", type: "number", step: 0.1 },
    { key: "cacheL3Mb", label: "Cache L3 (MB)", type: "number" },
    { key: "processNm", label: "Processo (nm)", type: "number" },
    { key: "integratedGpu", label: "GPU integrata", type: "text" },
  ],
  gpu: [
    { key: "vramGb", label: "VRAM (GB)", type: "number" },
    { key: "vramType", label: "Tipo VRAM", type: "text", placeholder: "GDDR6X" },
    { key: "boostClockMhz", label: "Boost clock (MHz)", type: "number" },
    { key: "cudaCores", label: "CUDA core", type: "number" },
    { key: "rayTracingCores", label: "RT core", type: "number" },
    { key: "tdpW", label: "TDP (W)", type: "number" },
    { key: "lengthMm", label: "Lunghezza (mm)", type: "number" },
    { key: "ports", label: "Porte video (una per riga)", type: "array" },
    { key: "recommendedPsuW", label: "PSU consigliato (W)", type: "number" },
  ],
  ram: [
    { key: "sizeGb", label: "Capacità per modulo (GB)", type: "number" },
    { key: "modulesCount", label: "Numero moduli", type: "number" },
    { key: "speedMhz", label: "Velocità (MHz)", type: "number" },
    { key: "casLatency", label: "Latenza CAS", type: "number" },
    { key: "voltage", label: "Voltaggio (V)", type: "number", step: 0.05 },
    { key: "rgb", label: "RGB", type: "boolean" },
  ],
  ssd: [
    { key: "capacityGb", label: "Capacità (GB)", type: "number" },
    { key: "interface", label: "Interfaccia", type: "text", placeholder: "NVMe PCIe 4.0" },
    { key: "readMbS", label: "Lettura (MB/s)", type: "number" },
    { key: "writeMbS", label: "Scrittura (MB/s)", type: "number" },
    { key: "tbw", label: "TBW", type: "number" },
    { key: "controller", label: "Controller", type: "text" },
    { key: "nandType", label: "Tipo NAND", type: "text", placeholder: "TLC, QLC" },
    { key: "dramCache", label: "DRAM cache", type: "boolean" },
  ],
  psu: [
    { key: "wattage", label: "Wattaggio (W)", type: "number" },
    { key: "efficiencyRating", label: "Certificazione", type: "select",
      options: ["", "80+ White", "80+ Bronze", "80+ Silver", "80+ Gold", "80+ Platinum", "80+ Titanium"] },
    { key: "modular", label: "Modularità", type: "select", options: ["", "Full", "Semi", "No"] },
    { key: "fanSizeMm", label: "Ventola (mm)", type: "number" },
    { key: "atxVersion", label: "Versione ATX", type: "text", placeholder: "ATX 3.0" },
    { key: "pcie5Connector", label: "Connettore 12VHPWR", type: "boolean" },
  ],
  motherboard: [
    { key: "chipset", label: "Chipset", type: "text", placeholder: "Intel Z790 / AMD B650" },
    { key: "memorySlots", label: "Slot RAM", type: "number" },
    { key: "maxMemoryGb", label: "RAM max (GB)", type: "number" },
    { key: "pcieVersion", label: "Versione PCIe", type: "text", placeholder: "5.0" },
    { key: "m2Slots", label: "Slot M.2", type: "number" },
    { key: "sataPorts", label: "Porte SATA", type: "number" },
    { key: "wifi", label: "Wi-Fi", type: "boolean" },
    { key: "bluetooth", label: "Bluetooth", type: "boolean" },
  ],
  case: [
    { key: "formFactorSupport", label: "Form factor supportati (uno per riga)", type: "array" },
    { key: "maxGpuLengthMm", label: "Lunghezza GPU max (mm)", type: "number" },
    { key: "maxCoolerHeightMm", label: "Altezza dissipatore max (mm)", type: "number" },
    { key: "fanSlotsIncluded", label: "Ventole incluse", type: "number" },
    { key: "radiatorSupport", label: "Radiatori supportati (uno per riga)", type: "array" },
    { key: "sidePanel", label: "Pannello laterale", type: "text" },
  ],
  cooling: [
    { key: "type", label: "Tipo", type: "select", options: ["", "Air", "AIO", "Custom"] },
    { key: "radiatorSizeMm", label: "Radiatore (mm, solo AIO)", type: "number" },
    { key: "fanCount", label: "Numero ventole", type: "number" },
    { key: "maxFanRpm", label: "RPM max", type: "number" },
    { key: "noiseDbA", label: "Rumorosità (dB(A))", type: "number", step: 0.1 },
    { key: "supportedSockets", label: "Socket supportati (uno per riga)", type: "array" },
  ],
};

// Mappa componentType → chiave del sotto-oggetto di specifications.
export const TYPE_TO_SPEC_GROUP = {
  CPU: "cpu",
  GPU: "gpu",
  RAM: "ram",
  SSD: "ssd",
  HDD: "ssd",
  Storage: "ssd",
  PSU: "psu",
  Motherboard: "motherboard",
  Case: "case",
  Cooling: "cooling",
};

// Campi della sezione compatibility: sono trasversali a molti tipi, quindi
// li mostriamo sempre ma con hint sul tipo consigliato.
export const COMPATIBILITY_FIELDS = [
  { key: "socket", label: "Socket", type: "text", placeholder: "AM5, LGA1700" },
  { key: "chipset", label: "Chipset", type: "text" },
  { key: "interface", label: "Interfaccia", type: "text", placeholder: "PCIe 4.0 x16" },
  { key: "formFactor", label: "Form factor", type: "text", placeholder: "ATX, mATX, ITX, DIMM, M.2 2280" },
  { key: "memoryType", label: "Tipo memoria", type: "select", options: ["", "DDR4", "DDR5"] },
  { key: "wattage", label: "Wattaggio (testo)", type: "text", placeholder: "850W" },
  { key: "tdp", label: "TDP (testo)", type: "text", placeholder: "170W" },
  { key: "pciExpressVersion", label: "Versione PCIe", type: "text", placeholder: "5.0" },
  { key: "memorySlots", label: "Slot RAM (solo mobo)", type: "number" },
  { key: "maxMemoryGb", label: "RAM max GB (solo mobo)", type: "number" },
  { key: "maxGpuLengthMm", label: "GPU max mm (solo case)", type: "number" },
  { key: "efficiencyRating", label: "Certificazione (solo PSU)", type: "text" },
];

// Parsing del valore dal form al formato atteso dal modello.
export const parseFieldValue = (field, rawValue) => {
  if (rawValue === "" || rawValue === null || rawValue === undefined) return undefined;

  switch (field.type) {
    case "number": {
      const n = Number(rawValue);
      return Number.isFinite(n) ? n : undefined;
    }
    case "boolean":
      return Boolean(rawValue);
    case "array":
      return String(rawValue)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    default:
      return String(rawValue).trim() || undefined;
  }
};

// Converte un valore del modello nel formato editor (stringa/boolean).
export const formatFieldValue = (field, value) => {
  if (value === null || value === undefined) return "";
  if (field.type === "array") {
    return Array.isArray(value) ? value.join("\n") : String(value);
  }
  if (field.type === "boolean") return Boolean(value);
  return String(value);
};
