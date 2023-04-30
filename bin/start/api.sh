#!/bin/bash -e

# Authorize the execution of this script from anywhere
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/../.."

echo "Waiting for postgres to be ready..."
yarn wait-on tcp:postgres:5432

echo "Running migrations..."
./bin/migration/run.sh

echo "Starting API..."
node dist/apps/api/main.js
