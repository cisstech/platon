#!/usr/bin/env bash

# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

# COLORS
# Reset
Color_Off=$'\e[0m' # Text Reset

# Regular Colors
Red=$'\e[0;31m'    # Red
Green=$'\e[0;32m'  # Green
Yellow=$'\e[0;33m' # Yellow
Purple=$'\e[0;35m' # Purple
Cyan=$'\e[0;36m'   # Cyan

OS=$(uname -s)

echo -e "$Purple\nChecking dependencies...\n$Color_Off"

# Checking if Docker is installed
if ! hash docker 2>/dev/null; then
  echo "docker:$Red ERROR - Docker must be installed (see: https://docs.docker.com/engine/installation/linux/docker-ce/debian/).$Color_Off" >&2
  exit 1
fi
echo -e "docker:$Green OK !$Color_Off"

if [ "$OS" = "Darwin" ]; then
  if ! hash brew; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  echo -e "brew:$Green OK !$Color_Off"

  if ! hash openssl 2>/dev/null; then
    brew install openssl
  fi
  echo -e "openssl:$Green OK !$Color_Off"
else
  if ! hash openssl 2>/dev/null; then
    echo "ERROR:$Red brew should be installed. visit https://cloudwafer.com/blog/installing-openssl-on-ubuntu-16-04-18-04/$Color_Off"
    exit 1
  fi
  echo -e "openssl:$Green OK !$Color_Off"

  if ! hash update-ca-certificates 2>/dev/null; then
    sudo apt-get install ca-certificates
  fi
  echo -e "update-ca-certificates:$Green OK !$Color_Off"
fi

echo -e "$Purple\nGenerating files...\n$Color_Off"

if [[ ! -f .env ]]; then
  echo -e "
# INCREASE DOCKER COMPOSE TIMEOUT DELAY DO NOT REMOVE THIS VAR
COMPOSE_HTTP_TIMEOUT=200

# POSTGRES
POSTGRES_USER=platon
POSTGRES_PASSWORD=test
POSTGRES_DB=platon_db
PG_DATA=/var/lib/postgresql/data

# PGADMIN
PGADMIN_DEFAULT_EMAIL=test@test.com
PGADMIN_DEFAULT_PASSWORD=test

# API
DB_NAME=platon_db
DB_USERNAME=platon
DB_PASSWORD=test
DB_HOST=postgres
DB_PORT=5431

" >>.env
fi
echo -e ".env:$Green OK !$Color_Off"

if ! grep -q "platon.dev" /etc/hosts; then
  sudo -- sh -c "echo \"127.0.0.1  platon.dev\" >> /etc/hosts"
fi
echo -e "/etc/hosts:$Green OK !$Color_Off"

mkdir -p .docker/nginx/ssl/certs
mkdir -p .docker/nginx/ssl/dhparam

# https://support.kerioconnect.gfi.com/hc/en-us/articles/360015200119-Adding-Trusted-Root-Certificates-to-the-Server

if [[ ! -f .docker/nginx/ssl/certs/platon.dev.crt ]]; then
  echo ""
  # Generate a ssl certificate of 10 years for platon.dev domain
  openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 3650 \
    -keyout .docker/nginx/ssl/certs/platon.dev.key \
    -out .docker/nginx/ssl/certs/platon.dev.crt <<EOF
fr
Ile-de-france
Champs-sur-marne
IGM
PLaTon
platon.dev
nobody@nobody.com
EOF

  if [ "$OS" = "Darwin" ]; then
    security delete-certificate -c "platon.dev"
    echo ""
    security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .docker/nginx/ssl/certs/platon.dev.crt
    echo ""
  else
    sudo rm -f /usr/local/share/ca-certificates/platon.dev.crt
    sudo update-ca-certificates --fresh

    sudo cp .docker/nginx/ssl/certs/platon.dev.crt /usr/local/share/ca-certificates/platon.dev.crt
    sudo update-ca-certificates
  fi
fi

echo -e ".docker/nginx/ssl/certs/platon.dev.key:$Green OK !$Color_Off"
echo -e ".docker/nginx/ssl/certs/platon.dev.crt:$Green OK !$Color_Off"

if [[ ! -f .docker/nginx/ssl/dhparam/dhparam.pem ]]; then
  openssl dhparam -out .docker/nginx/ssl/dhparam/dhparam.pem 2048
fi
echo -e ".docker/nginx/ssl/dhparam/dhparam.pem:$Green OK !\n$Color_Off"
