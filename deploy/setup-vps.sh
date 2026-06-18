#!/usr/bin/env bash
# Pasang Tryout SIMAK UI di VPS (nginx + HTTPS otomatis).
# Jalankan DI VPS, dari dalam folder hasil upload. Contoh:
#   sudo SRC="$HOME/tryout" bash deploy/setup-vps.sh contohdomain.com www.contohdomain.com
#
# - Argumen 1: domain utama (wajib)
# - Argumen 2: domain www (opsional)
# - Variabel SRC: folder berisi index.html (default: folder saat ini)
# - Variabel EMAIL: email untuk Let's Encrypt (default di bawah)
set -euo pipefail

DOMAIN="${1:?Pakai: sudo SRC=\$HOME/tryout bash deploy/setup-vps.sh domain.com [www.domain.com]}"
WWW="${2:-}"
SRC="${SRC:-$(pwd)}"
EMAIL="${EMAIL:-prof.mf3@gmail.com}"
DEST="/var/www/tryout-simak-ui"

echo ">> Memasang nginx, certbot, rsync ..."
if command -v apt >/dev/null 2>&1; then
  apt update -y
  apt install -y nginx certbot python3-certbot-nginx rsync
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y nginx certbot python3-certbot-nginx rsync
else
  echo "!! Paket manager tidak dikenali. Pasang nginx, certbot, python3-certbot-nginx, rsync secara manual."; exit 1
fi

echo ">> Menyalin berkas ke $DEST ..."
mkdir -p "$DEST"
rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude '.claude' \
  --exclude '.DS_Store' --exclude 'tryout-simak-ui-HP.html' \
  "$SRC"/ "$DEST"/
chown -R www-data:www-data "$DEST" 2>/dev/null || chown -R nginx:nginx "$DEST" 2>/dev/null || true

echo ">> Menulis konfigurasi nginx ..."
CONF=/etc/nginx/sites-available/tryout-simak-ui
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
cat > "$CONF" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW};
    root ${DEST};
    index index.html;

    location / { try_files \$uri \$uri/ /index.html; }

    # cache aset statis
    location ~* \.(css|js|json|png|jpe?g|svg|ico|webp)\$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
NGINX
ln -sf "$CONF" /etc/nginx/sites-enabled/tryout-simak-ui

# Pastikan blok sites-enabled di-include (beberapa distro tidak default)
if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
  sed -i 's#http {#http {\n    include /etc/nginx/sites-enabled/*;#' /etc/nginx/nginx.conf
fi

echo ">> Tes & reload nginx ..."
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl reload nginx || systemctl restart nginx

echo ">> Mengaktifkan HTTPS (Let's Encrypt) ..."
CERT_ARGS=(-d "$DOMAIN")
[ -n "$WWW" ] && CERT_ARGS+=(-d "$WWW")
certbot --nginx "${CERT_ARGS[@]}" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo ""
echo "✅ Selesai. Buka: https://${DOMAIN}"
echo "   Untuk update di kemudian hari, jalankan: bash deploy/update-vps.sh"
