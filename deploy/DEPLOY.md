# Deploy ke VPS + domain sendiri

Aplikasi ini **statis** (tanpa backend), jadi cukup disajikan nginx + HTTPS.
Ganti `contohdomain.com` dengan domainmu, dan `user@IP_VPS` dengan akun & IP VPS-mu.

## 0) Arahkan DNS dulu (sekali saja)
Di panel domain, buat **A record**:

| Type | Name | Value          |
|------|------|----------------|
| A    | @    | (IP VPS kamu)  |
| A    | www  | (IP VPS kamu)  |

Tunggu propagasi (biasanya beberapa menit). Cek: `dig +short contohdomain.com` → harus muncul IP VPS.

## 1) Upload folder dari Mac ke VPS
Jalankan **di Mac** (di terminal sesi ini bisa pakai prefix `!`):

```bash
rsync -av --exclude '.git' --exclude '.claude' --exclude '.DS_Store' \
  "/Users/muhammadfarid/Desktop/tryout simak ui offline version/" \
  user@IP_VPS:~/tryout/
```

(Jika belum ada `rsync`, bisa pakai `scp -r`.)

## 2) Pasang otomatis di VPS
SSH ke VPS lalu jalankan skrip (sudah termasuk install nginx, konfigurasi, dan HTTPS):

```bash
ssh user@IP_VPS
cd ~/tryout
sudo SRC=~/tryout bash deploy/setup-vps.sh contohdomain.com www.contohdomain.com
```

Selesai → buka **https://contohdomain.com** dari HP / perangkat mana pun.

## 3) Update setelah ada perubahan
Ulangi langkah upload (1), lalu di VPS:

```bash
cd ~/tryout
sudo SRC=~/tryout bash deploy/update-vps.sh
```

---

## Catatan penting
- **Data tetap per-perangkat.** Online di sini = bisa diakses lewat URL. Soal/rekor/statistik
  tetap disimpan di localStorage tiap browser; tidak otomatis sinkron antar HP & laptop.
  Pindahkan lewat menu **Input Soal → Export / Import**.
- Mau data **ikut di semua perangkat** (login + sinkron)? Itu butuh backend/database.
  VPS-mu sanggup menjalankannya — minta saja, nanti dibuatkan (mis. dengan Supabase
  self-hosted atau API kecil + SQLite/Postgres).
- Sertifikat HTTPS Let's Encrypt **otomatis diperbarui** oleh certbot (timer systemd).
- Firewall: pastikan port **80** & **443** terbuka (mis. `sudo ufw allow 'Nginx Full'`).
