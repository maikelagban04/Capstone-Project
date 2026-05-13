# KyronTech — Server

Backend Express + MongoDB di KyronTech. Per la documentazione completa del progetto vedi il [README principale](../README.md).

## Setup rapido

```bash
npm install
cp .env.example .env       # compila MONGO_URI, JWT_SECRET, SUPER_ADMIN_*
npm run seed:super-admin   # crea l'utente admin iniziale
npm run dev                # → http://localhost:5000
```

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia con nodemon (auto-reload) |
| `npm start` | Avvia in produzione |
| `npm run seed:super-admin` | Crea/aggiorna il super admin (`SUPER_ADMIN_EMAIL`) |
| `npm run lint` | ESLint |
| `npm test` | Vitest (test API con supertest) |

## Variabili d'ambiente

Vedi `.env.example` per la lista completa con commenti.

**Obbligatorie:** `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`.

**Opzionali:** Google OAuth (`GOOGLE_*`), Cloudinary (`CLOUDINARY_*`), email (`SMTP_*` o `SENDGRID_*`).

L'app rileva automaticamente quali servizi opzionali sono configurati: se mancano, le feature correlate vengono semplicemente disabilitate (es. niente bottone "Login con Google" se mancano le credenziali, le email vengono saltate, ecc.).

## API Endpoints

Base path: `/api`

### Auth (`/api/auth`)
- `POST /register` — registrazione email/password
- `POST /login` — login email/password
- `GET /google` — avvia OAuth Google
- `GET /google/callback` — callback OAuth
- `POST /google/exchange` — scambio codice OAuth → JWT
- `GET /me` — profilo utente loggato

### Products (`/api/products`)
- `GET /` — lista prodotti (con filtri query)
- `GET /:id` — dettaglio prodotto
- `POST /` 🔒 admin — crea prodotto
- `PUT /:id` 🔒 admin — aggiorna prodotto
- `DELETE /:id` 🔒 admin — elimina prodotto
- `POST /upload` 🔒 admin — upload immagine su Cloudinary

### Orders (`/api/orders`)
- `POST /` 🔒 — crea ordine dal carrello
- `GET /me` 🔒 — ordini dell'utente loggato
- `GET /` 🔒 admin — tutti gli ordini
- `PUT /:id/status` 🔒 admin — aggiorna stato ordine

### Users (`/api/users`)
- `GET /` 🔒 admin — lista utenti
- `PUT /:id/role` 🔒 super admin — cambia ruolo
- `PUT /:id/block` 🔒 admin — blocca/sblocca
- `DELETE /:id` 🔒 super admin — elimina utente
- `GET /me/wishlist` 🔒 — wishlist dell'utente
- `POST /me/wishlist/:productId` 🔒 — toggle wishlist

## Struttura

```
src/
├── app.js              # Configurazione Express (CORS, routes, error handler)
├── server.js           # Bootstrap (connect DB + listen)
├── config/             # db, cloudinary, passport (Google OAuth)
├── controllers/        # authController, productController, orderController, userController
├── middleware/         # protect, adminOnly, superAdminOnly, errorHandler, upload
├── models/             # User, Product, Order (Mongoose schemas)
├── routes/             # authRoutes, productRoutes, orderRoutes, userRoutes
├── seeds/              # superAdminSeed
└── utils/              # generateToken, emailService, sendgridMail
```

## Note

- **Super admin**: l'email definita in `SUPER_ADMIN_EMAIL` ha privilegi speciali (gestione utenti, accesso a `/admin/inventory`). Non può essere registrata via `/auth/register`: solo via `seed:super-admin`.
- **CORS**: configura `CLIENT_URL` con l'origin esatto del frontend. Per Vercel preview deploy puoi attivare `CORS_ALLOW_VERCEL_APP=true`.
- **Cloudinary**: tutti gli upload finiscono nella folder `kyrontech/`.
