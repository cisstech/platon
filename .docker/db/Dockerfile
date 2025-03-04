FROM postgres:13

# Install necessary build tools and postgresql-server-dev for pgvector
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  build-essential \
  postgresql-server-dev-13 \
  git \
  wget \
  && rm -rf /var/lib/apt/lists/*

# Clone pgvector repository
RUN git clone --depth 1 https://github.com/pgvector/pgvector.git /tmp/pgvector

# Build and install pgvector extension
WORKDIR /tmp/pgvector
RUN make && make install

# Switch back to root directory
WORKDIR /

# Create a directory for initialization scripts
#RUN mkdir -p /docker-entrypoint-initdb.d

# Add a script to create the pgvector extension in the default database
# This script will be executed when the container is first started
#COPY init-db.sh /docker-entrypoint-initdb.d/

# Make the initialization script executable
#RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh

# Expose the default PostgreSQL port
EXPOSE 5432

# Command to start PostgreSQL (already defined in the base image, but good to be explicit)
CMD ["postgres"]
