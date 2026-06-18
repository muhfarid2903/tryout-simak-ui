# Deploy lewat Coolify

Aplikasi ini statis. Coolify men-deploy-nya dari **repo Git** memakai **Dockerfile**
(sudah disediakan di root). Coolify yang mengurus domain + HTTPS otomatis.

## 1) Dorong kode ke Git
Repo lokal sudah di-init. Tambahkan remote provider yang dipakai Coolify
(GitHub / GitLab / Gitea), lalu push:

```bash
git remote add origin <URL_REPO_KAMU>     # mis. git@github.com:user/tryout-simak-ui.git
git push -u origin main
```

## 2) Buat resource di Coolify
1. **+ New** → **Application**.
2. Sumber: pilih Git provider & repo `tryout-simak-ui` (branch `main`).
3. **Build Pack: Dockerfile** (Coolify akan mendeteksi `Dockerfile` di root).
4. **Port: 80** (sesuai `EXPOSE 80` di Dockerfile).
5. **Domains**: isi `https://contohdomain.com` — Coolify otomatis menerbitkan
   sertifikat Let's Encrypt. Pastikan DNS domain (A record) sudah mengarah ke
   IP server Coolify lebih dulu.
6. **Deploy**.

Selesai → buka `https://contohdomain.com` dari HP / perangkat mana pun.

## 3) Update berikutnya
Cukup `git push` — aktifkan **Auto Deploy** (webhook) di Coolify agar tiap push
langsung ter-deploy, atau klik **Redeploy** manual.

---

### Alternatif tanpa Dockerfile (Static build pack)
Coolify juga punya build pack **Static**: pilih itu, set **Publish Directory** ke `/`
(root, karena `index.html` ada di root) — Coolify menyajikannya via nginx bawaan.
Dockerfile lebih disarankan karena hasilnya konsisten dan sudah termasuk cache + gzip.

### Catatan data
Online = bisa diakses lewat URL. **Data tetap per-perangkat** (localStorage tiap browser),
tidak otomatis sinkron antar HP & laptop — pindahkan via **Input Soal → Export / Import**.
Kalau mau login + sinkron antar perangkat, perlu backend (bisa dibuatkan, dan Coolify
bisa menjalankan database seperti Postgres untuk itu).
