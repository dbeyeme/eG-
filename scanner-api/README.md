# Scanner API (provisoire)

API Node qui interroge MySQL pour authentifier un billet à l’embarquement.

## Prod

| Service | URL |
|---------|-----|
| API Railway | https://scanner-api-production-e278.up.railway.app |
| Health | https://scanner-api-production-e278.up.railway.app/health |
| Scanner Vercel | https://scanner-app-gamma.vercel.app |

Projet Railway : `observant-joy` (services `MySQL` + `scanner-api`). Dump importé (1461 tickets).

### Comptes seed

| User | Password | Rôle |
|------|----------|------|
| `v241` | `Admin241!` | admin |
| `Premium-transport` | `Premium241!` | agence PREMIUM TRANSPORT |

## Prérequis local

1. MySQL local démarré
2. Dump importé :

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`voyageur-241\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
mysql -u root voyageur-241 < ../voyageur-241.sql
```

3. Migrations :

```bash
cd scanner-api
cp .env.example .env
npm install
npm run db:migrate-scans
```

## Démarrage local

```bash
npm run dev
```

Health : `GET http://127.0.0.1:3001/health`  
Login : `POST /api/v1/auth/login`  
Verify : `POST /api/v1/tickets/verify`

## Règles métier (provisoires)

| Verdict | Condition |
|---------|-----------|
| `not_found` | numéro absent |
| `invalid` | ticket supprimé **ou** sans `manifeste_id` |
| `already_scanned` | déjà dans `ticket_scan` |
| `mismatch` | champs QR ≠ base (si fournis) |
| `valid` | présent en manifeste + 1er scan |

## Tickets PDF de test

```bash
npm run fixtures:tickets
```

PDFs dans `fixtures/tickets-pdf/`.
