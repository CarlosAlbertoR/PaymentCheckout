#!/bin/bash

set -euo pipefail

# ---------------------------------
# Constants and initialization
# ---------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
CONNECTION_TYPE="local" # local|remote
SCHEMA_ONLY=false
DB_SERVICE_NAME="postgres"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
OUTPUT_DIR="$BACKEND_DIR/backups"
TMP_DIR="$SCRIPT_DIR/tmp"

log() { echo "[$1] $2"; }

parse_args() {
  for arg in "$@"; do
    case "$arg" in
      --schema-only) SCHEMA_ONLY=true ;;
      local|remote) CONNECTION_TYPE="$arg" ;;
    esac
  done

  log INFO "Script dir: $SCRIPT_DIR"
  log INFO "Backend dir: $BACKEND_DIR"
  log INFO "Connection: $CONNECTION_TYPE"
  log INFO "Schema only: $SCHEMA_ONLY"
}

load_env() {
  ENV_FILE="$BACKEND_DIR/.env"
  if [ ! -f "$ENV_FILE" ]; then
    log ERROR "Env file not found: $ENV_FILE"
    exit 1
  fi
  log INFO "Loading env from: $ENV_FILE"
  while IFS= read -r line || [ -n "$line" ]; do
    line=$(echo "$line" | tr -d '\r')
    if [[ ! "$line" =~ ^# && -n "$line" ]]; then
      var_name=$(echo "$line" | cut -d '=' -f1)
      var_value=$(echo "$line" | cut -d '=' -f2- | sed 's/\s*#.*$//')
      export "$var_name=$var_value"
    fi
  done <"$ENV_FILE"
  log INFO "Loaded: $(env | grep -E "^(DB_|POSTGRES_)" | grep -v PASSWORD | xargs)"
}

init_paths() {
  mkdir -p "$OUTPUT_DIR" "$TMP_DIR"
  FULL_BACKUP_FILE="$OUTPUT_DIR/db_backup_${TIMESTAMP}.sql"
  SCHEMA_FILE="$OUTPUT_DIR/schema_dump_${TIMESTAMP}.sql"
}

ensure_services() {
  if ! docker compose ps --format '{{.Name}}' | grep -q "${DB_SERVICE_NAME}$"; then
    log INFO "Starting docker services..."
    docker compose up -d
  fi
}

validate_file() {
  local path="$1"; local label="$2"
  if [ ! -f "$path" ]; then log ERROR "$label no existe: $path"; return 1; fi
  if [ ! -s "$path" ]; then log ERROR "$label vacío: $path"; return 1; fi
  if ! head -n 5 "$path" | grep -q "PostgreSQL database dump"; then
    log WARNING "$label sin cabecera estándar de pg_dump (puede ser válido)"
  fi
  log INFO "$label OK: $(du -h "$path" | cut -f1)"
}

dump_inside_container() {
  local outfile="$1"; shift
  local args=("$@")
  local tmp_in_container="/tmp/dump_${TIMESTAMP}.sql"

  # Prefer TCP to avoid socket permission surprises. Use env or defaults.
  local host_in_container="localhost"
  local user_in_container="${DB_USERNAME:-${DB_USER:-postgres}}"
  local db_in_container="${DB_DATABASE:-payment_checkout}"
  local password_in_container="${DB_PASSWORD:-password}"

  # Run pg_dump inside container writing to a temp file, then docker cp
  docker compose exec -T ${DB_SERVICE_NAME} sh -lc \
    "PGPASSWORD=${password_in_container} pg_dump -h ${host_in_container} -U ${user_in_container} -d ${db_in_container} ${args[*]} > ${tmp_in_container}"

  docker compose cp ${DB_SERVICE_NAME}:${tmp_in_container} "$outfile"
  docker compose exec -T ${DB_SERVICE_NAME} sh -lc "rm -f ${tmp_in_container}"
}

perform_backup() {
  if [ "$SCHEMA_ONLY" = true ]; then
    dump_inside_container "$SCHEMA_FILE" "--schema-only"
    validate_file "$SCHEMA_FILE" "Schema dump"
  else
    dump_inside_container "$FULL_BACKUP_FILE"
    validate_file "$FULL_BACKUP_FILE" "Full backup"
  fi
}

main() {
  parse_args "$@"
  load_env
  init_paths
  ensure_services
  perform_backup
  log INFO "Backup completed. Files at: $OUTPUT_DIR"
}

main "$@"


