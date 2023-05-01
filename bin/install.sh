#!/usr/bin/env bash
# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."


function print_status() {
  local status="$1"
  local message="$2"
  local color="$3"

  echo -e "${color}${status}: ${message}${Color_Off}"
}

function command_exists() {
  command -v "$1" >/dev/null 2>&1
}

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

echo -e "${Purple}\nChecking dependencies...\n${Color_Off}"

# Checking if Docker is installed
if ! command_exists docker; then
  print_status "docker" "ERROR - Docker must be installed (see: https://docs.docker.com/engine/installation/linux/docker-ce/debian/)." "$Red"
  exit 1
fi
print_status "docker" "OK !" "$Green"



# Install yarn if not installed
if ! command_exists yarn; then
  npm install -g yarn
fi
print_status "yarn" "OK !" "$Green"


if [ "$OS" = "Darwin" ]; then # Mac OS
  if ! hash brew; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  print_status "brew" "OK !" "$Green"

  if ! command_exists openssl; then
    brew install openssl
  fi
  print_status "openssl" "OK !" "$Green"
else # Linux
  if ! command_exists openssl; then
    print_status "ERROR" "openssl should be installed. visit https://cloudwafer.com/blog/installing-openssl-on-ubuntu-16-04-18-04/" "$Red"
    exit 1
  fi
  print_status "openssl" "OK !" "$Green"
  if ! command_exists update-ca-certificates; then
    sudo apt-get install ca-certificates
  fi
  print_status "update-ca-certificates" "OK !" "$Green"
fi


echo -e "${Purple}\nGenerating files...\n${Color_Off}"

if [[ ! -f .env ]]; then
  cp ./templates/.env.example .env
fi
echo -e ".env:$Green OK !$Color_Off"

if [[ ! -f ./tools/database/init.json ]]; then
  cp ./templates/init.example.json ./tools/database/init.json
fi
echo -e "./tools/database/init.json:$Green OK !$Color_Off"


mkdir -p .docker/nginx/ssl/certs
mkdir -p .docker/nginx/ssl/dhparam

# https://support.kerioconnect.gfi.com/hc/en-us/articles/360015200119-Adding-Trusted-Root-Certificates-to-the-Server

if [[ ! -f .docker/nginx/ssl/certs/localhost.crt ]]; then
  echo ""
  # Generate a ssl certificate of 10 years for localhost domain
  openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 3650 \
    -keyout .docker/nginx/ssl/certs/localhost.key \
    -out .docker/nginx/ssl/certs/localhost.crt <<EOF
fr
PROVINCE_STATE
CITY
PLaTon
PLaTon
localhost
nobody@nobody.com
EOF

  if [ "$OS" = "Darwin" ]; then
    security delete-certificate -c "localhost"
    echo ""
    security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .docker/nginx/ssl/certs/localhost.crt
    echo ""
  else
    sudo rm -f /usr/local/share/ca-certificates/localhost.crt
    sudo update-ca-certificates --fresh

    sudo cp .docker/nginx/ssl/certs/localhost.crt /usr/local/share/ca-certificates/localhost.crt
    sudo update-ca-certificates
  fi
fi

echo -e ".docker/nginx/ssl/certs/localhost.key:$Green OK !$Color_Off"
echo -e ".docker/nginx/ssl/certs/localhost.crt:$Green OK !$Color_Off"

if [[ ! -f .docker/nginx/ssl/dhparam/dhparam.pem ]]; then
  openssl dhparam -out .docker/nginx/ssl/dhparam/dhparam.pem 2048
fi
echo -e ".docker/nginx/ssl/dhparam/dhparam.pem:$Green OK !\n$Color_Off"
