# Situs statis Tryout SIMAK UI — disajikan nginx.
# Cocok untuk Coolify (build pack: Dockerfile). Coolify mengurus domain + HTTPS.
FROM nginx:alpine

# Konfigurasi nginx (cache + gzip + fallback index.html)
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Hanya berkas web yang disalin (tanpa skrip deploy, dokumen, dll.)
COPY index.html style.css app.js contoh-import-soal.json /usr/share/nginx/html/

EXPOSE 80
