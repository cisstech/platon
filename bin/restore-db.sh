#!/usr/bin/env bash

# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

#!/bin/sh

source .env

# Check if the script received an argument
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 path_to_sql_file"
  exit 1
fi

echo "Check if the DB_USERNAME and DB_NAME environment variables are set"
if [ -z "$DB_USERNAME" ]; then
  echo "Error: DB_USERNAME environment variable is not set"
  exit 1
fi
if [ -z "$DB_NAME" ]; then
  echo "Error: DB_NAME environment variable is not set"
  exit 1
fi
echo "DB_NAME: $DB_NAME, DB_USERNAME: $DB_USERNAME"
echo

# Get the path to the SQL file from the script arguments
sql_file_path=$1
sql_file_name=$(basename $sql_file_path)

echo "### Starting postgres ..."
docker-compose -f docker-compose.dev.yml up --force-recreate -d postgres
echo

echo "Copying the SQL file to the running Docker container"
docker cp $sql_file_path platon_postgres:/tmp/
echo

echo "Dropping the database"
docker exec -it platon_postgres dropdb --if-exists -U $DB_USERNAME $DB_NAME
echo

echo "Creating the database"
docker exec -it platon_postgres createdb -U $DB_USERNAME $DB_NAME
echo

echo "Restoring the database using the SQL file $sql_file_name"
docker exec -it platon_postgres psql -U $DB_USERNAME -d $DB_NAME -f /tmp/$sql_file_name
echo
