# PC Components E-Commerce Store

Una piattaforma ecommerce specializzata nella vendita di componenti per computer. Il progetto è stato completamente trasformato da un generico dropshipping store a un negozio verticale per componenti PC di alta qualità.

## Cosa è stato modificato

### Backend (Server)

#### 1. **Modello Product Potenziato** (`server/src/models/Product.js`)
Il modello Product ora include campi specifici per componenti PC:

- **componentType**: Tipo di componente (CPU, GPU, RAM, SSD, HDD, Motherboard, PSU, Case, Cooling, Monitor, Storage, Accessory)
- **brand**: Brand del componente (Intel, AMD, NVIDIA, Samsung, ecc.)
- **model**: Modello specifico del prodotto
- **specifications**: Specifiche tecniche dinamiche:
  - `cores`: Numero di core (per CPU)
  - `frequency`: Frequenza (per CPU/GPU)
  - `memory`: Memoria (per RAM/GPU)
  - `capacity`: Capacità (per storage)
  - `speed`: Velocità (per RAM/storage)
  - `power`: Potenza (per PSU/CPU)
  - `details`: Mappa di specifiche personalizzate
- **compatibility**: Informazioni di compatibilità:
  - `socket`: Socket CPU (LGA 1700, AM5, ecc.)
  - `chipset`: Chipset supportati
  - `interface`: Interfaccia (PCIe, SATA, ecc.)
  - `formFactor`: Fattore di forma (M.2, 2.5", ecc.)
  - `memoryType`: Tipo di memoria (DDR5, DDR4, ecc.)
  - `wattage`: Potenza della PSU
  - `tdp`: Thermal Design Power
- **stock**: Quantità in magazzino
- **inStock**: Boolean calcolato automaticamente

#### 2. **Controller API Aggiornato** (`server/src/controllers/productController.js`)
- `createProduct`: Ora accetta tutti i nuovi campi per componenti PC
- `updateProduct`: Supporta l'aggiornamento di specifiche e compatibilità
- `getProducts`: Filtro avanzato per `componentType` oltre a categoria e ricerca

#### 3. **Seed Data con 20 Componenti PC** (`server/src/seeds/productSeed.js`)
Il file include:
- **CPU**: Intel Core i9-13900KS, AMD Ryzen 7 5800X3D
- **GPU**: NVIDIA GeForce RTX 4090, AMD Radeon RX 7900 XTX
- **RAM**: Corsair Dominator Platinum RGB DDR5, Kingston Fury Beast DDR4
- **Storage**: Samsung 990 Pro NVMe, WD_BLACK SN850X
- **Motherboard**: ASUS ROG STRIX Z790-E, MSI MPG B850 Edge
- **PSU**: Corsair RM1000e, EVGA SuperNOVA
- **Case**: Lian Li LANCOOL 3, Corsair 5000T RGB
- **Cooling**: Noctua NH-D15, Corsair H150i Elite
- **Monitor**: LG 27GN950-B, ASUS ROG PG279QM

### Frontend (Client)

#### 1. **HomePage Potenziata** (`client/src/pages/HomePage.jsx`)
- **Nuovo hero section** con messaging specifico per componenti PC
- **Filter bar dinamica**: 12 bottoni per filtrare per tipo di componente
- **Ricerca migliorata**: Cerca in title, description, brand e model
- **Messaggi della sezione vuota** quando nessun prodotto corrisponde

#### 2. **ProductCard Migliorata** (`client/src/components/ProductCard.jsx`)
- Mostra il **brand e model** del componente
- Visualizza le **specifiche chiave** rilevanti (cores, frequency, memory, capacity)
- Indicatore **stock status** - bottone "Out of Stock" quando esaurito
- Badge del tipo di componente anziché categoria generica

#### 3. **ProductDetailPage Completa** (`client/src/pages/ProductDetailPage.jsx`)
- Sezione **Specifications** con tutte le caratteristiche tecniche
- Sezione **Compatibility** con informazioni di compatibilità
- Visualizzazione del **brand e model** prominenti
- Contatore di **stock disponibile**
- Bottone disabilitato quando il prodotto è esaurito

#### 4. **Styling Migliorato** (`client/src/index.css`)
- **Filter buttons**: Con stati attivo/inattivo e hover effects
- **Component specs display**: Griglia responsive per specifiche tecniche
- **Compatibility section**: Sezione dedicata alle informazioni di compatibilità
- **Mobile responsive**: Layout adattivo per schermi piccoli

## Come usare

### 1. Installazione

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. Seed Database

Per popolare il database con i 20 componenti PC di esempio:

```bash
cd server
npm run seed
```

Questo comando:
- Connette al database MongoDB
- Cancella i prodotti esistenti
- Inserisce 20 componenti PC realistici con complete specifiche

### 3. Avviare l'applicazione

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Il server girerà su `http://localhost:5000` e il frontend su `http://localhost:5173` (Vite)

## Struttura Dati - Esempio Prodotto

```javascript
{
  // Campi base (come prima)
  title: "Intel Core i9-13900KS",
  description: "High-performance flagship processor...",
  category: "Processors",
  priceBase: 690,
  markup: 15,
  finalPrice: 793.50,
  image: "https://...",
  
  // Nuovi campi per PC components
  componentType: "CPU",
  brand: "Intel",
  model: "Core i9-13900KS",
  
  specifications: {
    cores: "24 cores / 32 threads",
    frequency: "6.0 GHz Turbo",
    power: "150W TDP"
  },
  
  compatibility: {
    socket: "LGA 1700",
    chipset: "Intel Z790"
  },
  
  stock: 15,
  inStock: true
}
```

## Funzionalità Principali

✅ **Filtraggio avanzato** per tipo di componente  
✅ **Ricerca full-text** su brand, model, title, description  
✅ **Specifiche tecniche** visualizzate in modo intelligente  
✅ **Compatibilità** chiara per ogni componente  
✅ **Gestione stock** con indicatori visivi  
✅ **Admin panel** per creare e gestire prodotti PC  
✅ **Responsive design** su mobile, tablet e desktop  

## Aggiungere Nuovi Prodotti

### Via Admin Panel
1. Accedi come admin
2. Vai alla sezione admin
3. Compila il form con:
   - Info base (title, description, prezzo)
   - **componentType** (scegli da dropdown)
   - **brand** e **model**
   - **specifications** (personalizzate per tipo)
   - **compatibility** (info di compatibilità)
   - **stock** (quantità disponibile)

### Via API Diretto
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AMD Ryzen 5 7600X",
    "description": "Mid-range gaming CPU...",
    "componentType": "CPU",
    "brand": "AMD",
    "model": "Ryzen 5 7600X",
    "category": "Processors",
    "priceBase": 249,
    "markup": 15,
    "image": "https://...",
    "specifications": {
      "cores": "6 cores / 12 threads",
      "frequency": "5.7 GHz Turbo",
      "power": "105W TDP"
    },
    "compatibility": {
      "socket": "AM5",
      "chipset": "AMD X670"
    },
    "stock": 25
  }'
```

## Tipi di Componenti Supportati

- **CPU** (Processori)
- **GPU** (Schede video)
- **RAM** (Memoria)
- **SSD** (Unità a stato solido)
- **HDD** (Hard disk)
- **Motherboard** (Schede madre)
- **PSU** (Alimentatori)
- **Case** (Case/Chassis)
- **Cooling** (Raffreddamento)
- **Monitor** (Schermi)
- **Storage** (Altro storage)
- **Accessory** (Accessori vari)

## File Modificati/Creati

### Backend
- ✏️ `server/src/models/Product.js` - Modello potenziato
- ✏️ `server/src/controllers/productController.js` - Controller aggiornato
- ✏️ `server/package.json` - Script seed aggiunto
- 🆕 `server/src/seeds/productSeed.js` - Seed data con 20 componenti

### Frontend
- ✏️ `client/src/pages/HomePage.jsx` - Filter bar e hero aggiornati
- ✏️ `client/src/pages/ProductDetailPage.jsx` - Specifiche e compatibilità
- ✏️ `client/src/components/ProductCard.jsx` - Card migliorata
- ✏️ `client/src/index.css` - Nuovi stili per componenti e filtri

## Prossimi Passi Suggeriti

1. **Personalizzare il seed data** con componenti reali e attuali
2. **Aggiungere immagini reali** dei componenti
3. **Implementare configuratore PC** per aiutare gli utenti a scegliere componenti compatibili
4. **Aggiungere recensioni e rating** per i componenti
5. **Integrare con fornitori** per aggiornamenti automatici stock/prezzo
6. **Aggiungere guida compatibilità** CPU-Motherboard-RAM
7. **Analytics** per tracciare componenti più venduti

## Note Importanti

- Il database usa MongoDB - assicurati di avere una connessione funzionante
- Le immagini nel seed data sono placeholder da Unsplash - personalizza con URLs reali
- I prezzi nel seed data sono esemplari - aggiorna con i prezzi reali
- Il sistema mantiene compatibilità con le funzionalità originali di autenticazione e ordini

---

**Progetto trasformato**: Dropship Store Pro → PC Components Store Pro 🖥️
