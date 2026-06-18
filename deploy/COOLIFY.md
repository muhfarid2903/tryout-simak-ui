# Deploy ke Coolify (full-stack: login + sinkron)

Aplikasi kini punya backend (Express) + Postgres. Repo:
**https://github.com/muhfarid2903/tryout-simak-ui**

## 1) Buat database PostgreSQL di Coolify
1. **+ New → Database → PostgreSQL** (mis. versi 16).
2. Beri nama, **Create**, lalu **Start**.
3. Buka tab database → salin **Postgres URL koneksi internal**
   (bentuknya `postgres://user:password@<host-internal>:5432/db`).
   *Pakai URL internal* (bukan public) agar app & DB lewat jaringan internal Coolify.

## 2) Buat Application dari GitHub
1. **+ New → Application → Public/Private Repository** → pilih repo
   `muhfarid2903/tryout-simak-ui`, branch `main`.
2. **Build Pack: Dockerfile** (otomatis terdeteksi).
3. **Port (Ports Exposes): `3000`**.
4. **Environment Variables** (tab Environment):
   - `DATABASE_URL` = URL internal Postgres dari langkah 1
   - `JWT_SECRET` = string acak panjang, mis.
     `4aee63d12d495ef174494b8c6293025329b5e8cd13ebcc069d164d0ed26d766c`
     (sebaiknya buat baru: `openssl rand -hex 32`)
   - `PORT` = `3000` (opsional, sudah default)
5. **Domains**: isi `https://tryout.balanglompo.com`.
6. **Deploy**.

> Jika DB & app beda "project/network" di Coolify, pastikan keduanya terhubung
> (Coolify biasanya menaruh di jaringan yang sama otomatis bila satu project).
> App akan retry koneksi DB ~30 detik saat start, jadi aman bila DB telat siap.

## 3) Alihkan domain dari container statis lama
Saat ini `tryout.balanglompo.com` masih dilayani container statis sementara.
Agar tidak bentrok dengan app Coolify (dua router Traefik untuk host yang sama),
hentikan container lama **setelah** app Coolify hidup:

```bash
ssh root@82.197.71.187 'docker rm -f tryout-simak-ui'
```

(Atau minta saya melakukannya.)

## 4) Auto-deploy
Aktifkan **Auto Deploy** (webhook) di Coolify → tiap `git push` ke `main`
otomatis ter-deploy. Untuk update kode: edit lokal → `git push`.

---

### Variabel lingkungan yang dibaca server
| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | ya (untuk login) | Koneksi Postgres. Tanpa ini, app tetap jalan tapi fitur akun nonaktif. |
| `JWT_SECRET` | ya (produksi) | Kunci tanda tangan token. |
| `PORT` | tidak | Default `3000`. |
| `PGSSL` | tidak | Set `true` jika DB butuh SSL (umumnya tidak untuk DB internal Coolify). |

### Catatan data & keamanan
- **Wajib login**: konten (paket & soal) dikelola admin secara terpusat; progres tiap
  user (rekor, statistik, bookmark) tersimpan & sinkron di semua perangkat.
- Registrasi terbuka untuk siapa saja yang tahu URL. Bila ingin dibatasi
  (mis. hanya kamu), minta ditambahkan kunci registrasi / mematikan endpoint register.
