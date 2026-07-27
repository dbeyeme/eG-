#!/usr/bin/env bash
# Importe voyageur-241.sql dans MySQL Railway (variables MYSQL* déjà injectées).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-$ROOT/../voyageur-241.sql}"

if [[ ! -f "$DUMP" ]]; then
  echo "Dump introuvable: $DUMP" >&2
  exit 1
fi

HOST="${MYSQLHOST:-${MYSQL_HOST:-127.0.0.1}}"
PORT="${MYSQLPORT:-${MYSQL_PORT:-3306}}"
USER="${MYSQLUSER:-${MYSQL_USER:-root}}"
PASS="${MYSQLPASSWORD:-${MYSQL_PASSWORD:-}}"
DB="${MYSQLDATABASE:-${MYSQL_DATABASE:-voyageur-241}}"

echo "Import $DUMP → $USER@$HOST:$PORT/$DB"
mysql -h "$HOST" -P "$PORT" -u "$USER" ${PASS:+-p"$PASS"} -e "CREATE DATABASE IF NOT EXISTS \`$DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
mysql -h "$HOST" -P "$PORT" -u "$USER" ${PASS:+-p"$PASS"} "$DB" < "$DUMP"
echo "Import OK"
