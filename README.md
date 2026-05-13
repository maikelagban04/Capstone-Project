# KyronTech

Ciao 👋 benvenuto su **KyronTech**, il mio capstone project per Epicode.

L'idea è semplice: un e-commerce dedicato esclusivamente ai **componenti PC**, pensato per chi vuole assemblarsi la propria macchina senza impazzire a controllare se la CPU entra nella scheda madre o se l'alimentatore basta per la GPU. Ci pensa il sito per te.

Dentro trovi:

- 🛒 un **catalogo** di CPU, GPU, RAM, SSD, motherboard, alimentatori, case, dissipatori — con filtri per brand, prezzo, sconti e disponibilità
- 🧩 un **PC Builder** dove scegli i componenti slot per slot e ti avvisa subito se qualcosa non torna (socket sbagliato, RAM DDR4 su mobo DDR5, GPU troppo lunga per il case, PSU sottodimensionato, ecc.)
- 💜 **wishlist**, **carrello persistente**, **dark mode** e tutto quello che ti aspetti da un e-commerce moderno
- 🔐 login email/password o **Google OAuth**
- 🛠️ una **dashboard admin** completa per gestire prodotti, inventario, utenti e ordini

È un progetto didattico ma scritto come fosse vero: niente shortcut, autenticazione seria con JWT, validazione lato server, controllo dei ruoli, deploy su Vercel + Render + MongoDB Atlas.

Se vuoi farlo girare in locale, segui la sezione [Setup locale](#setup-locale). Se ti interessa solo guardare il codice, parti da [Struttura del progetto](#struttura-del-progetto).

---

**Capstone Project — Epicode Full Stack Web Development**

---

## Stack

**Frontend** · React 19 · Vite 8 · React Router 7 · CSS custom (no UI library oltre Bootstrap minimo) · Context API per auth/cart/wishlist/theme

**Backend** · Node.js · Express 5 · MongoDB + Mongoose · JWT auth · Passport (Google OAuth 2.0) · Cloudinary (upload immagini) · Nodemailer / SendGrid (email transazionali)

**Deploy** · Frontend su Vercel · Backend su Render/Railway · DB su MongoDB Atlas

---

## Funzionalità principali

- **Catalogo** con filtri per categoria, brand, prezzo, sconto, stock
- **Pagina prodotto** con galleria, specifiche tipizzate (CPU/GPU/RAM/SSD/PSU/Mobo/Case/Cooling), compatibilità
- **PC Builder** con 8 slot (CPU, Motherboard, GPU, RAM, Storage, PSU, Cooling, Case) e validatore automatico: socket, memoria DDR4/5, form factor, lunghezza GPU vs case, wattaggio PSU, ecc.
- **Carrello** persistente in localStorage + drawer laterale
- **Wishlist** sincronizzata col backend (per utenti loggati)
- **Auth** email/password + Google OAuth
- **Checkout** con calcolo totali, sconto cart, ordini salvati a DB
- **Dashboard admin** (ruolo `admin`):
  - CRUD prodotti con form dinamico per tipo
  - Inventario rapido (stock + prezzi)
  - Gestione utenti (promuovi/declassa admin, blocca, elimina)
  - Gestione ordini
- **Super admin** (email riservata server-side): unico accesso a `/admin/inventory`
- **Tema dark/light** persistente

---

## Setup locale

### Prerequisiti

- Node.js 20+
- MongoDB locale o account [MongoDB Atlas](https://www.mongodb.com/atlas)
- (Opzionale) Account [Cloudinary](https://cloudinary.com) per upload immagini
- (Opzionale) Google Cloud project con OAuth credentials per login Google

### 1 · Clona e installa

```bash
git clone https://github.com/maikelagban04/Capstone-Project.git
cd "Capstone Project"

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2 · Configura le variabili d'ambiente

```bash
# Server
cd server
cp .env.example .env
# Apri .env e compila: MONGO_URI, JWT_SECRET, SUPER_ADMIN_*

# Client
cd ../client
cp .env.example .env
# Verifica VITE_API_URL=http://localhost:5000/api
```

Vedi i commenti dentro `.env.example` per dettagli su ciascuna variabile.

### 3 · Crea il super admin

```bash
cd server
npm run seed:super-admin
```

Crea l'utente admin con email/password definiti in `SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD`.

### 4 · Avvia

```bash
# Terminale 1 (backend)
cd server
npm run dev   # → http://localhost:5000

# Terminale 2 (frontend)
cd client
npm run dev   # → http://localhost:5173
```

---

## Variabili d'ambiente

Riferimento rapido. Per le descrizioni complete vedi `server/.env.example` e `client/.env.example`.

### Server (`server/.env`)

| Variabile | Obbligatoria | Note |
|-----------|:-:|------|
| `MONGO_URI` | ✅ | Connection string MongoDB |
| `JWT_SECRET` | ✅ | Segreto per firmare JWT (min 48 char random) |
| `JWT_EXPIRES_IN` | | Default `7d` |
| `PORT` | | Default `5000` |
| `NODE_ENV` | | `development` / `production` |
| `CLIENT_URL` | ✅ | Origin del frontend (CORS). Multipli separati da virgola |
| `CORS_ALLOW_VERCEL_APP` | | `true` per permettere tutti i `*.vercel.app` |
| `SUPER_ADMIN_EMAIL` | ✅ | Email del super admin |
| `SUPER_ADMIN_NAME` | | Nome visualizzato |
| `SUPER_ADMIN_PASSWORD` | ✅ | Usata solo dal seed |
| `GOOGLE_CLIENT_ID` / `SECRET` / `CALLBACK_URL` | | Opzionali — se assenti, il login Google viene nascosto |
| `CLOUDINARY_*` | | Opzionali — upload immagini admin |
| `SMTP_*` / `SENDGRID_*` | | Opzionali — email transazionali |

### Client (`client/.env`)

| Variabile | Obbligatoria | Note |
|-----------|:-:|------|
| `VITE_API_URL` | ✅ | URL base del backend (es. `http://localhost:5000/api`) |
| `VITE_SUPER_ADMIN_EMAIL` | | Per nascondere/mostrare il link "Inventario" |

---

## Comandi utili

### Server

```bash
npm run dev               # Avvia con nodemon
npm start                 # Avvia in produzione
npm run lint              # ESLint
npm test                  # Vitest
npm run seed:super-admin  # Crea il super admin
```

### Client

```bash
npm run dev      # Vite dev server
npm run build    # Build produzione → dist/
npm run preview  # Anteprima build
npm run lint     # ESLint
```

---

## Struttura del progetto

```
.
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── api/            # Client HTTP
│   │   ├── assets/         # Logo, hero
│   │   ├── components/     # Header, Footer, CartDrawer, ProductCard, ...
│   │   ├── context/        # Auth, Cart, Wishlist, Theme
│   │   ├── hooks/          # useAuth, useCart, useWishlist, useTheme
│   │   ├── pages/          # HomePage, CatalogPage, PCBuilderPage, AdminDashboardPage, ...
│   │   └── utils/          # productFormSchema (campi dinamici per tipo)
│   └── public/
└── server/                 # Backend Express + MongoDB
    └── src/
        ├── config/         # db, cloudinary, passport
        ├── controllers/    # auth, product, order, user
        ├── middleware/     # auth, error, upload
        ├── models/         # User, Product, Order
        ├── routes/         # /api/auth, /api/products, /api/orders, /api/users
        ├── seeds/          # superAdminSeed
        └── utils/          # generateToken, emailService, sendgridMail
```

---

## Deploy

### Frontend (Vercel)

1. Importa la cartella `client/` come progetto Vercel
2. Build command: `npm run build` · Output: `dist`
3. Environment variables: `VITE_API_URL` con l'URL backend di produzione

### Backend (Render / Railway / Fly.io)

1. Importa la cartella `server/` come servizio Node
2. Build command: `npm install` · Start: `npm start`
3. Environment variables: tutte quelle di `server/.env.example`
4. Imposta `CLIENT_URL` all'URL del frontend Vercel (o `CORS_ALLOW_VERCEL_APP=true` per le preview)

### Database (MongoDB Atlas)

1. Crea un cluster gratuito
2. Whitelist IP `0.0.0.0/0` per Render (o IP specifico)
3. Copia la connection string in `MONGO_URI`

---

## Sicurezza

- Le password sono salvate in DB hashate con **bcryptjs**
- I JWT sono firmati con `JWT_SECRET` (cambialo in produzione!)
- Il super admin è hardcoded server-side: non può essere registrato via `/auth/register`
- CORS configurato per accettare solo `CLIENT_URL`
- Cloudinary firma gli upload con `API_SECRET` (mai esposto al client)

---

## Licenza

Progetto didattico — Epicode Capstone 2026
