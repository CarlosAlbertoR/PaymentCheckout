#!/bin/bash

set -euo pipefail

# 📍 Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# 🎯 Mode: local (default) | remote | prod | staging
CONNECTION_TYPE=${1:-"local"}

# 🧩 Load env file (supports .env, .env.prod, .env.staging under backend)
ENV_FILE="$BACKEND_DIR/.env"
if [ "$CONNECTION_TYPE" == "prod" ]; then
  ENV_FILE="$BACKEND_DIR/.env.prod"
elif [ "$CONNECTION_TYPE" == "staging" ]; then
  ENV_FILE="$BACKEND_DIR/.env.staging"
fi

if [ -f "$ENV_FILE" ]; then
  export $(awk -F'#' '{print $1}' "$ENV_FILE" | grep -E '^[A-Za-z_][A-Za-z0-9_]*=.*$' | tr -d '\r' | xargs)
  echo "Loaded environment variables from $ENV_FILE:"
  env | grep -E '^DB_' | grep -v PASSWORD || true
else
  echo "❌ Error: Environment file $ENV_FILE not found."
  exit 1
fi

# 🔧 Defaults
DB_USER="${DB_USERNAME:-${DB_USER:-postgres}}"
DB_NAME="${DB_DATABASE:-payment_checkout}"
DB_PASS="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# 🐳 Compose service name in this repo
DB_SERVICE="postgres"

check_container_running() {
  if ! docker compose ps --format '{{.Name}}' | grep -q "${DB_SERVICE}$"; then
    echo "❌ Error: Docker service '${DB_SERVICE}' is not running."
    docker compose ps
    exit 1
  fi
}

reset_database_local() {
  echo "🔁 Dropping database '${DB_NAME}'..."
  docker compose exec -T ${DB_SERVICE} sh -lc \
    "PGPASSWORD=${DB_PASS} psql -U ${DB_USER} -h localhost -d postgres -c \"DROP DATABASE IF EXISTS ${DB_NAME};\""

  echo "🔁 Creating database '${DB_NAME}' owned by '${DB_USER}'..."
  docker compose exec -T ${DB_SERVICE} sh -lc \
    "PGPASSWORD=${DB_PASS} psql -U ${DB_USER} -h localhost -d postgres -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\""

  echo "✅ Database '${DB_NAME}' has been reset."
}

reset_database_remote() {
  echo "🔁 Dropping database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}..."
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"

  echo "🔁 Creating database '${DB_NAME}' owned by '${DB_USER}'..."
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

  echo "✅ Database '${DB_NAME}' has been reset (remote)."
}

case "$CONNECTION_TYPE" in
  local)
    check_container_running
    reset_database_local
    ;;
  prod|staging)
    echo "❌ Error: Unsupported connection type '$CONNECTION_TYPE' for destructive reset."
    exit 1
    ;;
  remote)
    reset_database_remote
    ;;
  *)
    echo "❌ Error: Unknown mode '$CONNECTION_TYPE'"
    exit 1
    ;;
esac


