#!/usr/bin/env bash
# Deploy full-stack (app Node + Postgres) di VPS, dirutekan Traefik (Coolify proxy).
set -euo pipefail
DOMAIN="${1:-tryout.balanglompo.com}"
APP_DIR="/opt/tryout-simak-ui/app"
SECRETS="/opt/tryout-simak-ui/secrets.env"
NET="coolify"
DB_NAME="tryout-simak-db"
APP_NAME="tryout-simak-ui"
DB_VOL="tryout-simak-db-data"

# Secrets dibuat sekali lalu dipakai ulang (agar token & DB tetap valid antar deploy).
if [ ! -f "$SECRETS" ]; then
  { echo "PGPASS=$(openssl rand -hex 16)"; echo "JWT_SECRET=$(openssl rand -hex 32)"; } > "$SECRETS"
  chmod 600 "$SECRETS"
  echo "🔐 Secrets dibuat di $SECRETS"
fi
. "$SECRETS"

# Postgres persisten
if ! docker ps -a --format '{{.Names}}' | grep -qx "$DB_NAME"; then
  docker volume create "$DB_VOL" >/dev/null
  docker run -d --name "$DB_NAME" --restart unless-stopped --network "$NET" \
    -e POSTGRES_USER=tryout -e POSTGRES_PASSWORD="$PGPASS" -e POSTGRES_DB=tryout \
    -v "$DB_VOL":/var/lib/postgresql/data postgres:16-alpine >/dev/null
  echo "🗄️  Postgres '$DB_NAME' dibuat."
else
  docker start "$DB_NAME" >/dev/null 2>&1 || true
  echo "🗄️  Postgres '$DB_NAME' sudah ada."
fi

# Build image app
echo "🔨 build image…"
docker build -t "$APP_NAME":latest "$APP_DIR" >/dev/null
echo "✅ build OK"

# Swap container app (replace yang lama/statis)
docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
docker run -d --name "$APP_NAME" --restart unless-stopped --network "$NET" \
  -e DATABASE_URL="postgres://tryout:${PGPASS}@${DB_NAME}:5432/tryout" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e PORT=3000 \
  --label 'traefik.enable=true' \
  --label 'traefik.docker.network=coolify' \
  --label 'traefik.http.routers.tryoutsimak-http.entrypoints=http' \
  --label "traefik.http.routers.tryoutsimak-http.rule=Host(\`$DOMAIN\`)" \
  --label 'traefik.http.routers.tryoutsimak-http.middlewares=tryoutsimak-redirect' \
  --label 'traefik.http.middlewares.tryoutsimak-redirect.redirectscheme.scheme=https' \
  --label 'traefik.http.middlewares.tryoutsimak-redirect.redirectscheme.permanent=true' \
  --label 'traefik.http.routers.tryoutsimak.entrypoints=https' \
  --label "traefik.http.routers.tryoutsimak.rule=Host(\`$DOMAIN\`)" \
  --label 'traefik.http.routers.tryoutsimak.tls=true' \
  --label 'traefik.http.routers.tryoutsimak.tls.certresolver=letsencrypt' \
  --label 'traefik.http.services.tryoutsimak.loadbalancer.server.port=3000' \
  "$APP_NAME":latest >/dev/null
echo "🚀 App '$APP_NAME' jalan untuk https://$DOMAIN"
