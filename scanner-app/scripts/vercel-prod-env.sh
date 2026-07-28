#!/usr/bin/env bash
# Configure Vercel Production env for canal PROD (voyageur241.com).
# Prérequis : `npx vercel login` ou VERCEL_TOKEN, projet linké dans scanner-app/.vercel
set -euo pipefail
cd "$(dirname "$0")/.."

VARS=(
  "VITE_API_BASE_URL=https://voyageur241.com"
  "VITE_API_TICKET_VERIFY_PATH=/api/v1/tickets/verify"
  "VITE_CORS_ORIGIN=https://scanner-app-gamma.vercel.app"
  "VITE_APP_VERSION=0.2.0-stable"
  "VITE_APP_CHANNEL=prod"
  "VITE_AUTH_MODE=agent"
)

echo "→ Ajout / mise à jour des variables Production…"
for pair in "${VARS[@]}"; do
  key="${pair%%=*}"
  val="${pair#*=}"
  # rm silencieux si absent, puis add
  npx vercel env rm "$key" production --yes 2>/dev/null || true
  printf '%s' "$val" | npx vercel env add "$key" production
  echo "  ✓ $key"
done

echo "→ Déploiement production…"
npx vercel --prod --yes

echo "Done. Vérifier https://scanner-app-gamma.vercel.app (badge PROD · v0.2.0-stable)."
