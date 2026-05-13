# KyronTech — Client

Frontend React + Vite di KyronTech. Per la documentazione completa del progetto vedi il [README principale](../README.md).

## Setup rapido

```bash
npm install
cp .env.example .env   # imposta VITE_API_URL
npm run dev            # → http://localhost:5173
```

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Vite dev server con HMR |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Anteprima della build |
| `npm run lint` | ESLint |

## Variabili d'ambiente

Vedi `.env.example`. Solo le variabili prefissate `VITE_` sono esposte al bundle.

- `VITE_API_URL` — URL base del backend (obbligatoria)
- `VITE_SUPER_ADMIN_EMAIL` — email del super admin (opzionale, solo per UI)

## Struttura

```
src/
├── api/         # Client HTTP (apiRequest)
├── assets/      # Logo, hero image
├── components/  # Header, Footer, CartDrawer, ProductCard, ScrollToTop, icons
├── context/     # AuthContext, CartContext, WishlistContext, ThemeContext
├── hooks/       # useAuth, useCart, useWishlist, useTheme
├── pages/       # HomePage, CatalogPage, ProductDetailPage, PCBuilderPage,
│                # CheckoutPage, AdminDashboardPage, InventoryAdminPage, ...
└── utils/       # productFormSchema (campi dinamici admin form)
```

