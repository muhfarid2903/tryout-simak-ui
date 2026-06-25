# Rencana Pengisian Bank Soal — SIMAK UI Pascasarjana

Pengungkit terbesar untuk lulus S2: **isi bank soal**, bukan tambah fitur. Mesin
belajar (SRS, diagnostik, tangga adaptif, jurnal kesalahan, pelatih) sudah lengkap;
SM-2 baru terasa optimal saat pool besar.

Prompt generator: [`prompts/simak-ui-pascasarjana.md`](prompts/simak-ui-pascasarjana.md).
**Semua batch pakai `id` paket yang sama: `"simak-pasca-01"`** → import **Tambahkan**
menyatukannya jadi satu paket.

## Target akhir: ±360 soal
| Mata uji | Target | Sub-topik | ~per sub-topik |
|---|---|---|---|
| Kemampuan Verbal | 90 | 5 | 18 |
| Kemampuan Kuantitatif | 105 | 7 | 15 |
| Kemampuan Penalaran | 75 | 5 | 15 |
| Bahasa Inggris | 90 | 7 | 13 |
| **Total** | **360** | 24 | — |

Tiap sub-topik: campuran **~30% Mudah / 50% Sedang / 20% Sulit**.

## Bertahap (jangan sekali jalan)
- **Fase 0 — MVP (~90 soal, minggu ini):** 1 batch per mata uji (20–25 soal, sebar
  lintas sub-topik). Begitu ada ≥8 soal/mata uji → jalankan **Tes Diagnostik** di
  ruangan Pascasarjana untuk dapat rencana belajar dari data nyata. Mulai belajar,
  jangan tunggu bank penuh.
- **Fase 1 — Lengkapi ke target (1–2 minggu):** lanjut per mata uji, dipecah batch
  ~20–25 soal. ≈ 16–17 batch total. Cicil satu batch per sesi.

## Alur satu batch (ulangi)
1. Salin blok prompt dari `prompts/simak-ui-pascasarjana.md`.
2. Set PARAMETER: `Mata uji = <satu mata uji>`, `Jumlah = 20–25` (opsional: fokus sub-topik).
3. Pastikan `id` paket di output = **`"simak-pasca-01"`** (sama di setiap batch).
4. Validasi cepat (skrip di `prompts/README.md`):
   ```bash
   node -e '...' paket.json
   ```
5. App → **Input Soal → ⬆ Import → Tambahkan**.
6. Cek **Bank Soal**: chip sub-topik & kesulitan muncul. Jika sub-topik tak bertaut
   materi → beda 1 karakter, perbaiki agar persis daftar.

## Checklist mutu tiap batch (tolak bila gagal)
- [ ] JSON valid, tanpa trailing comma, 5 opsi + 5 `optExplain`.
- [ ] `subject` & `subtopic` persis dari daftar resmi.
- [ ] Kunci tak ambigu, satu benar; hitungan diverifikasi.
- [ ] Distraktor = kesalahan berpikir nyata (bukan acak).
- [ ] Backslash LaTeX dobel (`$\\frac{...}$`), rumus tampil benar.
- [ ] Campuran kesulitan ~30/50/20 terjaga.

## Pelacakan (centang tiap batch ±20–25 soal selesai diimport)

### Kemampuan Verbal — target 90
- [ ] Batch 1  - [ ] Batch 2  - [ ] Batch 3  - [ ] Batch 4
- Sub-topik: Sinonim · Antonim · Analogi · Pengelompokan/Pengecualian · Pemahaman Wacana
- Terkumpul: ____ / 90

### Kemampuan Kuantitatif — target 105
- [ ] Batch 1  - [ ] Batch 2  - [ ] Batch 3  - [ ] Batch 4  - [ ] Batch 5
- Sub-topik: Deret · Pecahan/Persen/Rasio · Rata-rata/Statistik · Aljabar · Kecepatan-Jarak-Waktu-Kerja · Peluang/Kombinatorik · Geometri Dasar
- Terkumpul: ____ / 105

### Kemampuan Penalaran — target 75
- [ ] Batch 1  - [ ] Batch 2  - [ ] Batch 3  - [ ] Batch 4
- Sub-topik: Logika Proposisi · Silogisme · Kuantifikasi & Negasi · Penalaran Analitis · Penalaran Himpunan
- Terkumpul: ____ / 75

### Bahasa Inggris — target 90
- [ ] Batch 1  - [ ] Batch 2  - [ ] Batch 3  - [ ] Batch 4
- Sub-topik: Tenses · SVA · Articles & Quantifiers · Prepositions · Parallelism · Conditionals · Reading & Vocabulary
- Terkumpul: ____ / 90

## Disiplin
- Jangan kejar 360 sekaligus — mutu turun & JSON terpotong.
- Periksa **setiap** batch sebelum import — soal salah kunci akan "mengajari" hal keliru lewat SRS.
- Isi & belajar jalan paralel: mulai begitu Fase 0 selesai.
