### STAGE 1: Build ###

FROM node:26-alpine AS build

# Install python3, make, g++, Git, and NodeGit dependencies
RUN apk add --no-cache --update \
  bash \
  python3 \
  make \
  g++ \
  git \
  openssh \
  libgit2-dev \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Set work directory
WORKDIR /src

# Copy dependencies
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node:node .yarn/releases ./.yarn/releases
COPY --chown=node:node shared ./shared

RUN apk add --no-cache \
  build-base \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  librsvg-dev \
  pixman-dev

# Install yarn: corepack provides the entry point, the release checked into .yarn/releases runs
RUN npm install -g corepack \
  && corepack enable

ENV YARN_HTTP_TIMEOUT=600000

# Install dependencies
RUN yarn install --immutable

COPY --chown=node:node apps/docs/package.json apps/docs/yarn.lock ./apps/docs/
RUN cd apps/docs && yarn install --immutable
# Bundle app source
COPY --chown=node:node .graphql ./.graphql
COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs
COPY --chown=node:node types ./types
COPY --chown=node:node nx.json  ./nx.json
COPY --chown=node:node tools ./tools
COPY --chown=node:node codegen.ts ./codegen.ts
COPY --chown=node:node schema.gql ./schema.gql
COPY --chown=node:node tsconfig.base.json  ./tsconfig.base.json
COPY --chown=node:node bin/cli/wc-docs.sh ./bin/cli/wc-docs.sh
# Generate GraphQL types
RUN yarn graphql:generate

# Build NestJS API, Angular web app and docs
RUN NODE_OPTIONS="--max-old-space-size=8192" yarn build:web
# Increase memory limit and disable daemon for API build
RUN NODE_OPTIONS="--max-old-space-size=4096" NX_DAEMON=false yarn build:api --verbose
RUN yarn build:docs

# Compile TypeScript migrations to JS (prod-safe, no ts-node needed at runtime)
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node tsconfig.migrations.json ./tsconfig.migrations.json
RUN yarn build:migrations

# Rebuild node_modules with only production dependencies
ENV NODE_ENV=production
RUN yarn workspaces focus --production

USER node

### STAGE 2: Frontend Extractor (pour extraction externe) ###
FROM node:26-alpine AS frontend-extractor
WORKDIR /src
COPY --chown=node:node --from=build /src/dist ./dist

### STAGE 3: Production API Only ###
FROM node:26-alpine AS production
RUN apk add --no-cache --update \
  bash \
  openssh \
  git \
  libgit2-dev \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /src

COPY --chown=node:node --from=build /src/node_modules ./node_modules
COPY --chown=node:node --from=build /src/dist/apps/api ./dist/apps/api
COPY --chown=node:node --from=build /src/dist/migrations ./dist/migrations
COPY --chown=node:node --from=build /src/dist/tools/datasource.prod.js ./dist/tools/datasource.prod.js
COPY --chown=node:node --from=build /src/schema.gql ./schema.gql
COPY --chown=node:node templates ./templates
COPY --chown=node:node .docker/node/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]