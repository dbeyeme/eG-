# Distinction des versions — Voyageur241 Scanner

| Canal | Version | Branche Git | API | Auth | Données | Déploiement |
|-------|---------|-------------|-----|------|---------|-------------|
| **PROD** | `0.2.0-stable` | `main` (après merge) | `https://voyageur241.com` | Agent local (`agentId`) | Production réelle | **Vercel Production** (`scanner-app-gamma.vercel.app`) |
| **LAB** | `0.2.0-lab` | `lab/railway-simulation` | Railway `scanner-api-production-e278` | JWT seed | Fixtures / dump de test | Preview uniquement — **jamais** alias prod |

## Règles

1. Seule la canal **PROD** peut être promu en production Vercel.
2. La branche `lab/railway-simulation` conserve la stack Railway + JWT + PDFs de simulation ; elle ne doit pas être déployée sur l’alias production.
3. Badge UI : `PROD · v0.2.0-stable` vs `LAB · v0.2.0-lab`.
4. Contrat API prod : [`docs/ticket-verify-contract.json`](docs/ticket-verify-contract.json).

## Variables Vercel (Production)

```
VITE_API_BASE_URL=https://voyageur241.com
VITE_API_TICKET_VERIFY_PATH=/api/v1/tickets/verify
VITE_CORS_ORIGIN=https://scanner-app-gamma.vercel.app
VITE_APP_VERSION=0.2.0-stable
VITE_APP_CHANNEL=prod
VITE_AUTH_MODE=agent
```

CORS côté `voyageur241.com` : autoriser `https://scanner-app-gamma.vercel.app` (methods `POST`, `OPTIONS`).
