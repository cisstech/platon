# Deploying PLaTon on a server

In production everything runs in Docker: nginx serves the web app and the documentation and passes
the API calls to its container, next to PostgreSQL, Redis and PgAdmin. The setup is the one of
`docker-compose.prod.yml` and `.docker/nginx/nginx.prod.conf`.

## Install

1. Clone the repository on the server, then generate `.env` and the default accounts:

   ```sh
   ./bin/install.sh
   ```

   Read `.env` before going further: its values come from `templates/.env.example`, which describes
   each setting, and the development ones (passwords, `SECRET_KEY`) do not belong on a server.

2. Choose the certificate:

   - **Let's Encrypt**: replace `example.com` with your domain in `bin/init-letsencrypt.sh`; in
     `.docker/nginx/nginx.prod.conf`, turn on the `### BEGIN CERTBOT ONLY ###` blocks and turn off the
     `### BEGIN NON CERTBOT ONLY ###` ones; in `docker-compose.prod.yml`, turn on the
     `# LET'S ENCRYPT SSL CONF` area of the nginx volumes.
   - **Your own certificate**: give the path of its files in `docker-compose.prod.yml` and in the
     nginx configuration.

3. Build the images and start the containers (`-d` to detach them):

   ```sh
   ./bin/docker/up.sh --prod
   ```

   The script asks whether to use Let's Encrypt for your domain: answer `Y` if you chose it in step 2.

4. Create the database schema, then the default accounts on a new database:

   ```sh
   DB_HOST=localhost ./bin/migration/run.sh
   DB_HOST=localhost ./bin/init-db.sh
   ```

## Afterwards

- To update: pull the code, run `./bin/docker/up.sh --prod` again, which rebuilds the images, then the
  migrations.
- To open a shell in a container: the scripts of `bin/shell/`.
- To save the database: `./bin/backup.sh [file]`; to replace it with a dump: `./bin/restore-db.sh <file>`
  (the current database is dropped).
- To offer the new interface: switch `platon-ui-next` from `off` to `opt-in` (or `default`) in the
  deployed `index.html`; everyone then keeps their own choice.
