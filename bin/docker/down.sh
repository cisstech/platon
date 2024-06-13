#!/bin/bash -e

# Authorize the execution of this script from anywhere
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/../.."


#docker container stop platon_postgres
#docker container stop platon_pgadmin
#docker container stop platon_redis
#docker container stop platon_api
#docker container stop platon_nginx
#docker container stop platon_certbot

docker compose -f docker-compose.prod.yml down

docker volume rm platon_dist
#docker network rm platon_platon-network
