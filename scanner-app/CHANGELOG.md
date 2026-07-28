# Changelog

## 0.2.0-stable (PROD)

- Canal **PROD** : API `https://voyageur241.com` (sans données de simulation)
- Auth agent locale (`VITE_AUTH_MODE=agent`) — pas de JWT Railway
- Badge UI PROD / LAB + `VERSIONS.md`
- Env Vercel documentées (`.env.example` / `.env.production`)
- Contrat JSON `docs/ticket-verify-contract.json`

## 0.2.0-lab (branche `lab/railway-simulation`)

- API Railway + JWT + comptes seed / fixtures PDF
- **Hors production Vercel**

## 0.2.0

- Mode clair / sombre
- Variables d’environnement API + CORS
- Auth ticket via API (`POST /api/v1/tickets/verify`)
- Préparation déploiement Vercel
