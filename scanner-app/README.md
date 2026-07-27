# Voyageur241 Scanner

App React (Vite + TypeScript) + Capacitor pour authentifier les billets à l’embarquement via scan QR.

**Version :** `0.2.0`

## Déploiement

| Composant | URL |
|-----------|-----|
| Scanner (Vercel) | https://scanner-app-gamma.vercel.app |
| API (Railway) | https://scanner-api-production-e278.up.railway.app |
| Health | https://scanner-api-production-e278.up.railway.app/health |

### Comptes de test

| Identifiant | Mot de passe | Rôle |
|-------------|--------------|------|
| `v241` | `Admin241!` | admin |
| `Premium-transport` | `Premium241!` | agence (PREMIUM TRANSPORT) |

## Démarrage local

```bash
# 1) API + MySQL (dump voyageur-241.sql) — voir ../scanner-api/README.md
cd ../scanner-api && npm install && npm run db:migrate-scans && npm run dev

# 2) App scanner
cd ../scanner-app
cp .env.example .env
npm install
npm run dev
```

Par défaut en prod l’app pointe sur l’API Railway. En local, mets `VITE_API_BASE_URL=http://127.0.0.1:3001`.

## Variables d’environnement

| Variable | Rôle |
|----------|------|
| `VITE_API_BASE_URL` | Base API (Railway ou local) |
| `VITE_API_TICKET_VERIFY_PATH` | Endpoint verify (`/api/v1/tickets/verify`) |
| `VITE_CORS_ORIGIN` | Origine à autoriser côté API CORS |
| `VITE_APP_VERSION` | Version affichée |

Contrat JSON : [`docs/ticket-verify-contract.json`](docs/ticket-verify-contract.json)

## Mode clair / sombre

Bouton soleil/lune dans le header et sur le login.

## Déploiement Vercel

```bash
cd scanner-app
npx vercel --prod
```

Configurer les `VITE_*` dans Vercel, puis redéployer. Mettre `VITE_CORS_ORIGIN` = URL Vercel et autoriser cette origine sur l’API voyageur241.
