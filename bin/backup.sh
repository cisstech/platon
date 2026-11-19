#!/usr/bin/env bash
# Saves the database of the running platon_postgres container into a dump that bin/restore-db.sh
# reads back. Usage: ./bin/backup.sh [path/to/file.dump], by default dumps/platon-<date>.dump.
set -euo pipefail

# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

source .env
: "${DB_USERNAME:?DB_USERNAME is not set in .env}"
: "${DB_NAME:?DB_NAME is not set in .env}"

if ! docker ps --format '{{.Names}}' | grep -qx platon_postgres; then
  echo "The platon_postgres container is not running: start it with ./bin/docker/up.sh first."
  exit 1
fi

target=${1:-dumps/platon-$(date +%Y%m%d-%H%M%S).dump}
mkdir -p "$(dirname "$target")"

echo "Saving the database $DB_NAME into $target"
docker exec platon_postgres pg_dump -U "$DB_USERNAME" -Fc "$DB_NAME" >"$target"
echo "Done: $(du -h "$target" | cut -f1)"
