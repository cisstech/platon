#!/usr/bin/env bash
# Replaces the database of the running platon_postgres container with a dump: a plain SQL file, or a
# custom-format dump such as bin/backup.sh writes. The current database is dropped.
# Usage: ./bin/restore-db.sh path/to/dump
set -euo pipefail

# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

source .env
: "${DB_USERNAME:?DB_USERNAME is not set in .env}"
: "${DB_NAME:?DB_NAME is not set in .env}"

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 path/to/dump"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx platon_postgres; then
  echo "The platon_postgres container is not running: start it with ./bin/docker/up.sh first."
  exit 1
fi

dump=$1
copy=/tmp/$(basename "$dump")

echo "Copying $dump into the container"
docker cp "$dump" "platon_postgres:$copy"

echo "Dropping and creating the database $DB_NAME"
docker exec platon_postgres dropdb --if-exists -U "$DB_USERNAME" "$DB_NAME"
docker exec platon_postgres createdb -U "$DB_USERNAME" "$DB_NAME"

# A custom-format dump starts with PGDMP and needs pg_restore; anything else is plain SQL.
if [ "$(head -c 5 "$dump")" = "PGDMP" ]; then
  docker exec platon_postgres pg_restore -U "$DB_USERNAME" -d "$DB_NAME" --no-owner "$copy"
else
  docker exec platon_postgres psql -q -U "$DB_USERNAME" -d "$DB_NAME" -f "$copy"
fi
docker exec platon_postgres rm -f "$copy"
echo "Done"
