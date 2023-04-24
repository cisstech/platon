FROM node:16-alpine

# https://stackoverflow.com/a/70471892
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

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

# Install yarn
RUN npm install -g yarn --force

# Set work directory
WORKDIR /src

# Copy dependencies
COPY yarn.lock /src/yarn.lock
COPY package.json /src/package.json
COPY tsconfig.base.json /src/tsconfig.base.json
COPY nx.json /src/nx.json
COPY .npmrc /src/.npmrc

# Install dependencies
RUN yarn

# Copy sources
COPY libs /src/libs
COPY apps/web /src/apps/web
COPY shared/assets /src/shared/assets
COPY shared/styles /src/shared/styles
