FROM node:16-alpine

# https://stackoverflow.com/a/70471892
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install python3
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Set work directory
WORKDIR /src

# Copy dependencies
COPY package-lock.json /src/package-lock.json
COPY package.json /src/package.json
COPY tsconfig.base.json /src/tsconfig.base.json
COPY nx.json /src/nx.json
COPY .npmrc /src/.npmrc

# Install dependencies
RUN npm ci

# Copy sources
COPY libs /src/libs
COPY apps/web /src/apps/web
COPY shared/assets /src/shared/assets
COPY shared/styles /src/shared/styles
