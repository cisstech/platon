### STAGE 1: Build ###

FROM node:16-alpine as build

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
COPY --chown=node:node package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --non-interactive

# Bundle app source
COPY --chown=node:node .graphql ./.graphql
COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs
COPY --chown=node:node shared ./shared
COPY --chown=node:node types ./types
COPY --chown=node:node nx.json  ./nx.json
COPY --chown=node:node codegen.ts ./codegen.ts
COPY --chown=node:node schema.gql ./schema.gql
COPY --chown=node:node tsconfig.base.json  ./tsconfig.base.json

# Generate GraphQL types
RUN yarn graphql:generate

# Build NestJS API and Angular web app
RUN yarn build:api
RUN yarn build:web

# Rebuild node_modules with only production dependencies
ENV NODE_ENV production
RUN yarn install --frozen-lockfile --non-interactive --production

USER node

### STAGE 2: Production ###

FROM node:16-alpine as production
RUN apk add --no-cache --update \
  bash \
  openssh \
  git \
  libgit2-dev \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /src

COPY --chown=node:node --from=build /src/node_modules ./node_modules
COPY --chown=node:node --from=build /src/dist ./dist
COPY --chown=node:node --from=build /src/schema.gql ./schema.gql
COPY --chown=node:node resources ./resources
COPY --chown=node:node templates ./templates
COPY --chown=node:node uploads ./uploads

USER node
