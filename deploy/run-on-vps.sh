#!/usr/bin/env bash
# Jalankan container nginx statis di jaringan Coolify + label Traefik (TLS otomatis).
set -euo pipefail
DOMAIN="${1:-tryout.balanglompo.com}"
NAME="tryout-simak-ui"

docker rm -f "$NAME" 2>/dev/null || true
docker run -d --name "$NAME" --restart unless-stopped \
  --network coolify \
  -v /opt/tryout-simak-ui/html:/usr/share/nginx/html:ro \
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
  --label 'traefik.http.services.tryoutsimak.loadbalancer.server.port=80' \
  nginx:alpine

echo "Container '$NAME' jalan untuk https://$DOMAIN"
