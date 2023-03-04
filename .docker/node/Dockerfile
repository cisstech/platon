FROM node:16-alpine

# https://stackoverflow.com/a/70471892
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install python3
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Install Git
RUN set -x \
    && . /etc/os-release \
    && case "$ID" in \
        alpine) \
            apk add --no-cache bash git openssh \
            ;; \
        debian) \
            apt-get update \
            && apt-get -yq install bash git openssh-server \
            && apt-get -yq clean \
            && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
            ;; \
    esac

# Install NodeGit dependencies
RUN apk update && \
    apk upgrade && \
    apk add git libgit2-dev && \
    rm -rf /tmp/* /var/cache/apk/*

# Set work directory
WORKDIR /src

# Copy dependencies
COPY package-lock.json /src/package-lock.json
COPY package.json /src/package.json
COPY tsconfig.base.json /src/tsconfig.base.json
COPY nx.json /src/nx.json
COPY .npmrc /src/.npmrc

# Install dependencies
RUN npm i --force

# Copy sources
COPY libs /src/libs
COPY apps/web /src/apps/web
COPY shared/assets /src/shared/assets
COPY shared/styles /src/shared/styles
