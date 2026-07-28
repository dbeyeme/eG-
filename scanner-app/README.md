# Voyageur241 Scanner

App React (Vite + TypeScript) + Capacitor pour authentifier les billets à l’embarquement via scan QR.

**Canal :** `PROD` · **Version :** `0.2.0-stable`  
Voir [`VERSIONS.md`](VERSIONS.md) pour la distinction PROD / LAB.

## Déploiement

| Composant | URL | Canal |
|-----------|-----|-------|
| Scanner (Vercel **production**) | https://scanner-app-gamma.vercel.app | PROD |
| API tickets | https://voyageur241.com | PROD |
| Lab API (Railway) | https://scanner-api-production-e278.up.railway.app | LAB seulement |

### Connexion PROD

Identifiant agent libre (ex. `Agent_1`) — pas de JWT. Les scans appellent `POST /api/v1/tickets/verify` sur voyageur241.com.

### Comptes LAB (branche `lab/railway-simulation` uniquement)

| Identifiant | Mot de passe | Rôle |
|-------------|--------------|------|
| `v241` | `Admin241!` | admin |
| `Premium-transport` | `Premium241!` | agence (PREMIUM TRANSPORT) |

## Démarrage local (PROD)

```bash
cd scanner-app
cp .env.example .env
npm install
npm run dev
```

Pour le lab Railway : checkout `lab/railway-simulation` et utiliser les variables commentées dans `.env.example`.

## Variables d’environnement

| Variable | Rôle | Prod |
|----------|------|------|
| `VITE_API_BASE_URL` | Base API | `https://voyageur241.com` |
| `VITE_API_TICKET_VERIFY_PATH` | Endpoint verify | `/api/v1/tickets/verify` |
| `VITE_CORS_ORIGIN` | Origine CORS | `https://scanner-app-gamma.vercel.app` |
| `VITE_APP_VERSION` | Version affichée | `0.2.0-stable` |
| `VITE_APP_CHANNEL` | `prod` \| `lab` | `prod` |
| `VITE_AUTH_MODE` | `agent` \| `jwt` | `agent` |

Contrat JSON : [`docs/ticket-verify-contract.json`](docs/ticket-verify-contract.json)

## Déploiement Vercel (PROD uniquement)

```bash
cd scanner-app
# Configurer les VITE_* (voir VERSIONS.md) puis :
npx vercel --prod
```

Ne jamais promouvoir la branche `lab/railway-simulation` vers l’alias production.
