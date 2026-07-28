---
name: voyageur-production
description: >-
  Met en production Vercel la version stable scanner (voyageur241.com, sans
  simulation). Use when deploying prod, setting Vercel env, promoting releases,
  or separating PROD vs LAB channels.
---

# Voyageur241 — Agent Production Scanner

## Mission

Déployer et maintenir le canal **PROD** du scanner sur Vercel :

- API : `https://voyageur241.com`
- Verify : `POST /api/v1/tickets/verify`
- CORS origin : `https://scanner-app-gamma.vercel.app`
- **Aucune** donnée / fixture de simulation
- Version affichée : `0.2.0-stable` (`VITE_APP_CHANNEL=prod`)

## Branches

| Branche | Rôle |
|---------|------|
| `main` (après merge prod) | Source de vérité **production** |
| `lab/railway-simulation` | Stack Railway + JWT + fixtures — **jamais** en prod |
| `cursor/prod-*` | PR de mise en prod |

Voir `scanner-app/VERSIONS.md`.

## Variables Vercel (Production)

```
VITE_API_BASE_URL=https://voyageur241.com
VITE_API_TICKET_VERIFY_PATH=/api/v1/tickets/verify
VITE_CORS_ORIGIN=https://scanner-app-gamma.vercel.app
VITE_APP_VERSION=0.2.0-stable
VITE_APP_CHANNEL=prod
VITE_AUTH_MODE=agent
```

Appliquer via `vercel env add` (scope production) puis `vercel --prod` depuis `scanner-app/`.

## Contrat API

Request / responses : `scanner-app/docs/ticket-verify-contract.json`.

Côté serveur voyageur241.com :

- Autoriser origin `https://scanner-app-gamma.vercel.app`
- Methods : `POST`, `OPTIONS`
- Headers : `Content-Type`, `Accept`, `X-Client-Origin`, `Authorization`

## Checklist avant promote prod

- [ ] Branche ≠ `lab/railway-simulation`
- [ ] `VITE_APP_CHANNEL=prod` et `VITE_API_BASE_URL=https://voyageur241.com`
- [ ] Pas de fixtures PDF / comptes seed dans le flux utilisateur
- [ ] Smoke : `POST .../tickets/verify` avec un QR réel → `status: valid|already_scanned|...`
- [ ] Badge UI affiche `PROD · v0.2.0-stable`
- [ ] Lab reste sur preview / branche séparée

## Interdits

- Ne pas pointer la prod Vercel vers Railway
- Ne pas merger lab→prod sans retirer simulation / JWT seed
- Ne pas committer secrets / tokens Vercel
