#!/bin/bash -e

# Authorize the execution of this script from anywhere
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/../.."

# https://stackoverflow.com/a/14203146

prod=false
detach=''
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -p|--prod)
      prod=true
      ;;
    -d)
      detach='-d'
      ;;
    *)
      # unknown option
      ;;
  esac
  shift # past argument
done

export SANDBOX_HOST=`./bin/find-ip.sh`
echo "SANDBOX_HOST=$SANDBOX_HOST"
export SANDBOX_PORT=7000

if [ "$prod" = true ]
then
    docker-compose -f docker-compose.prod.yml build
    ./bin/init-letsencrypt.sh
    docker-compose -f docker-compose.prod.yml up $detach
else
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.dev.yml up $detach
fi
