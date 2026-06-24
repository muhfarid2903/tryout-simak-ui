# Prompt: Paket Soal — SBMPTN / UTBK (TPS)

Tempel blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`. Output =
JSON murni siap **Input Soal → ⬆ Import**. Program: **SBMPTN**.

> Ruangan ini fokus pada **Tes Potensi Skolastik (TPS)** UTBK. Untuk literasi/
> penalaran matematika UTBK lengkap, buat paket terpisah dengan mata uji tambahan.

=== MULAI PROMPT ===

Kamu penyusun soal **UTBK-SBMPTN bagian Tes Potensi Skolastik (TPS)** yang ahli
psikometri. Buat **satu paket soal** dalam **JSON valid** sesuai skema persis di
bawah. **Tujuan utama: soal harus REALISTIS sesuai UTBK TPS yang sesungguhnya** —
tiru gaya stimulus, panjang bacaan, dan tingkat penalaran soal UTBK terkini
(berbasis stimulus/konteks, menekankan nalar bukan hafalan).

## ACUAN ASLI (ikuti agar realistis)
TPS UTBK terdiri dari 4 subtes:
- **Penalaran Umum (~30 soal):** penalaran induktif, deduktif, dan kuantitatif;
  banyak berbasis tabel/grafik/teks; soal "kesimpulan yang PASTI benar".
- **Pengetahuan dan Pemahaman Umum (~20 soal):** kosakata, hubungan makna,
  melengkapi kalimat, ide pokok ringkas.
- **Pemahaman Bacaan dan Menulis (~20 soal):** bacaan + perbaikan kalimat/ejaan,
  kepaduan paragraf, kata penghubung, PUEBI.
- **Pengetahuan Kuantitatif (~20 soal):** aritmetika, aljabar, geometri, data —
  termasuk soal **kecukupan data** (pernyataan 1 & 2).

> **Cara pakai (BATCH → 1 paket lengkap):** generate **per subtes** (20–30 soal/run)
> agar JSON tidak terpotong & mutu terjaga. Pakai `id` paket yang **sama persis**
> (`"sbmptn-tps-01"`) di tiap run, lalu import dengan opsi **Tambahkan** — semua batch
> otomatis tergabung menjadi **satu paket utuh** di aplikasi.

## PARAMETER (boleh kuubah)
- Nama paket: "Tryout SBMPTN (UTBK) — {EDIT}"
- Hanya **satu subtes per run**. Subtes run ini: {EDIT, mis. "Penalaran Umum"}
- Jumlah soal run ini: {EDIT, mis. 20}
- Campuran kesulitan: ~25% Mudah (1), ~50% Sedang (2), ~25% Sulit (3).

## SKEMA WAJIB
```json
{
  "packages": [{
    "id": "sbmptn-tps-01",
    "name": "<nama paket>",
    "program": "SBMPTN",
    "mode": "sections",
    "durationMin": 90,
    "sectionMinutes": { "Penalaran Umum": 30, "Pengetahuan dan Pemahaman Umum": 15, "Pemahaman Bacaan dan Menulis": 25, "Pengetahuan Kuantitatif": 20 },
    "shuffleQuestions": true,
    "shuffleOptions": true
  }],
  "questions": [ /* objek soal */ ]
}
```

### Field tiap soal
- `packageId`: selalu `"sbmptn-tps-01"`.
- `subject`: **persis** salah satu: `"Penalaran Umum"`, `"Pengetahuan dan Pemahaman Umum"`, `"Pemahaman Bacaan dan Menulis"`, `"Pengetahuan Kuantitatif"`.
- `subtopic`: pilih dari saran di bawah; konsisten ejaannya.
- `difficulty`: `1` | `2` | `3`.
- `text`: untuk soal berstimulus, tulis **teks/tabel/grafik dalam bentuk teks** lalu pertanyaannya (pisahkan dengan `\n`).
- `options`: 5 (A–E). `answer`: `"A"`–`"E"`. `pembahasan`: 1–3 kalimat.
- `optExplain`: 5 string sejajar — distraktor menyebut **kesalahan nalar** (overgeneralisasi, membalik implikasi, salah baca data).
- `steps`: langkah untuk Pengetahuan Kuantitatif & Penalaran kuantitatif; selain itu `[]`.
- JANGAN sertakan `id` & `image`.

### Saran SUB-TOPIK
- **Penalaran Umum:** `"Penalaran Induktif (Pola)"`, `"Penalaran Deduktif (Silogisme)"`, `"Penalaran Kuantitatif"`, `"Analisis Tabel & Grafik"`, `"Kesimpulan Logis"`
- **Pengetahuan dan Pemahaman Umum:** `"Makna Kata & Kosakata"`, `"Hubungan Makna"`, `"Melengkapi Kalimat"`, `"Ide Pokok"`
- **Pemahaman Bacaan dan Menulis:** `"Ide Pokok & Simpulan"`, `"Kalimat Efektif"`, `"Ejaan & PUEBI"`, `"Kepaduan Paragraf"`, `"Kata Penghubung"`
- **Pengetahuan Kuantitatif:** `"Aritmetika & Persen"`, `"Aljabar"`, `"Geometri & Pengukuran"`, `"Statistika & Peluang"`, `"Kecukupan Data"`

### Aturan MATEMATIKA (renderer offline, BUKAN MathJax)
- Apit rumus `$...$`. Backslash **dobel**: `"$\\frac{3}{4}$"`. Didukung `\\frac \\sqrt`, pangkat `x^2`/`x^{10}`, `\\times \\div \\leq \\geq \\neq \\pi`.

### MUTU & REALISME (wajib)
1. Banyak soal **berbasis stimulus** (teks/tabel) seperti UTBK asli.
2. Soal "kesimpulan PASTI benar": hanya satu opsi yang benar-benar mengikuti premis; sisanya overgeneralisasi/bertentangan.
3. "Kecukupan data": opsi standar — (A) pernyataan 1 saja cukup, (B) pernyataan 2 saja cukup, (C) keduanya bersama cukup, (D) masing-masing cukup, (E) keduanya tidak cukup.
4. Kunci tak ambigu; verifikasi hitungan & logika.

## OUTPUT
HANYA JSON valid, tanpa pagar ```` ``` ````, tanpa teks lain, tanpa *trailing comma*.

=== AKHIR PROMPT ===
