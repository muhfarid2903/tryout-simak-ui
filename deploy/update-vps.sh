#!/usr/bin/env bash
# Perbarui berkas situs setelah ada perubahan kode (jalankan DI VPS dari folder upload terbaru).
#   sudo SRC="$HOME/tryout" bash deploy/update-vps.sh
set -euo pipefail
SRC="${SRC:-$(pwd)}"
DEST="/var/www/tryout-simak-ui"

rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude '.claude' \
  --exclude '.DS_Store' --exclude 'tryout-simak-ui-HP.html' \
  "$SRC"/ "$DEST"/
chown -R www-data:www-data "$DEST" 2>/dev/null || chown -R nginx:nginx "$DEST" 2>/dev/null || true
echo "✅ Berkas diperbarui di $DEST"
