#!/bin/bash

set -euo pipefail

# Usage: restore_db.sh <backup_file> [local|remote]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
MODE="${2:-local}"
BACKUP_FILE="${1:-}"
DB_SERVICE_NAME="postgres"

log() { echo "[$1] $2"; }

if [ -z "$BACKUP_FILE" ]; then
  log ERROR "Backup file not provided"
  exit 1
fi
if [ ! -f "$BACKUP_FILE" ]; then
  log ERROR "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load env
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  log ERROR ".env not found: $ENV_FILE"
  exit 1
fi
while IFS= read -r line || [ -n "$line" ]; do
  line=$(echo "$line" | tr -d '\r')
  if [[ ! "$line" =~ ^# && -n "$line" ]]; then
    var_name=$(echo "$line" | cut -d '=' -f1)
    var_value=$(echo "$line" | cut -d '=' -f2- | sed 's/\s*#.*$//')
    export "$var_name=$var_value"
  fi
done <"$ENV_FILE"

DB_USER="${DB_USERNAME:-${DB_USER:-postgres}}"
DB_NAME="${DB_DATABASE:-payment_checkout}"
DB_PASS="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

log INFO "Restoring into database: $DB_NAME (user=$DB_USER host=$DB_HOST port=$DB_PORT)"

if [ "$MODE" = "local" ]; then
  # Ensure services running
  docker compose up -d

  # Copy dump into container and restore
  TMP_PATH="/tmp/restore.sql"
  docker compose cp "$BACKUP_FILE" ${DB_SERVICE_NAME}:${TMP_PATH}
  docker compose exec -T ${DB_SERVICE_NAME} sh -lc \
    "PGPASSWORD=${DB_PASS} dropdb -U ${DB_USER} -h localhost --if-exists ${DB_NAME} && \
     PGPASSWORD=${DB_PASS} createdb -U ${DB_USER} -h localhost ${DB_NAME} && \
     PGPASSWORD=${DB_PASS} psql -U ${DB_USER} -h localhost -d ${DB_NAME} -f ${TMP_PATH} && \
     rm -f ${TMP_PATH}"
else
  # Remote restore from host
  PGPASSWORD="$DB_PASS" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$DB_NAME" || true
  PGPASSWORD="$DB_PASS" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
fi

log INFO "Restore completed successfully."


