# Prompt: Paket Soal — SIMAK UI Pascasarjana (S2/S3)

Tempel blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`. Output =
JSON murni siap **Input Soal → ⬆ Import**. Program: **SIMAK UI Pascasarjana**.

=== MULAI PROMPT ===

Kamu penyusun soal **SIMAK UI Pascasarjana (S2/S3)** yang ahli pedagogi &
psikometri. Buat **satu paket soal** dalam **JSON valid** sesuai skema persis di
bawah. **Tujuan utama: soal harus REALISTIS setara ujian asli SIMAK UI Pascasarjana**
— bukan soal SD/SMP, bukan soal "kuis umum". Tiru gaya, kedalaman, dan tipe
distraktor TPA SIMAK UI yang sesungguhnya.

## ACUAN ASLI (ikuti agar realistis)
SIMAK UI Pascasarjana menguji **TPA (Tes Potensi Akademik)** + **Bahasa Inggris** akademik:
- **TPA ≈ 100 soal** dalam ~2 jam: Verbal (analogi, sinonim/antonim, wacana),
  Kuantitatif (deret, aritmetika, aljabar, geometri dasar), Penalaran (logika
  formal, analitis, silogisme).
- **Bahasa Inggris** akademik setara TOEFL: structure & written expression +
  reading comprehension (teks ilmiah).
- Karakter soal asli: **berpikir, bukan menghafal**; bacaan bertema akademik;
  distraktor menjebak yang mencerminkan kesalahan nalar umum.

> **Cara pakai (BATCH → 1 paket lengkap):** generate **per mata uji** (20–30 soal/run)
> agar JSON tidak terpotong & mutu terjaga. Pakai `id` paket yang **sama persis**
> (`"simak-pasca-01"`) di tiap run, lalu import dengan opsi **Tambahkan** — semua
> batch otomatis tergabung menjadi **satu paket utuh** di aplikasi.

## PARAMETER (boleh kuubah)
- Nama paket: "Tryout SIMAK UI Pascasarjana — {EDIT}"
- Hanya **satu mata uji per run** (disarankan untuk mutu). Mata uji run ini: {EDIT, mis. "Kemampuan Verbal"}
- Jumlah soal run ini: {EDIT, mis. 25}
- Campuran kesulitan: ~30% Mudah (1), ~50% Sedang (2), ~20% Sulit (3).

## SKEMA WAJIB
```json
{
  "packages": [{
    "id": "simak-pasca-01",
    "name": "<nama paket>",
    "program": "SIMAK UI Pascasarjana",
    "mode": "sections",
    "durationMin": 170,
    "sectionMinutes": { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 50, "Kemampuan Penalaran": 40, "Bahasa Inggris": 50 },
    "shuffleQuestions": true,
    "shuffleOptions": true
  }],
  "questions": [ /* objek soal */ ]
}
```

### Field tiap soal
- `packageId`: selalu `"simak-pasca-01"`.
- `subject`: **persis** salah satu: `"Kemampuan Verbal"`, `"Kemampuan Kuantitatif"`, `"Kemampuan Penalaran"`, `"Bahasa Inggris"`.
- `subtopic`: **persis** dari daftar di bawah.
- `difficulty`: `1` | `2` | `3`.
- `text`, `options` (5, urut A–E), `answer` (`"A"`–`"E"`), `pembahasan` (1–3 kalimat).
- `optExplain`: 5 string sejajar `options` — untuk distraktor, sebut **kesalahan berpikir** yang membuatnya menggoda.
- `steps`: array langkah (hanya Kuantitatif & Penalaran berhitung); selain itu `[]`.
- JANGAN sertakan `id` & `image`.

### SUB-TOPIK (salin persis)
- **Kemampuan Verbal:** `"Sinonim (Padanan Kata)"`, `"Antonim (Lawan Kata)"`, `"Analogi (Padanan Hubungan)"`, `"Pengelompokan / Pengecualian"`, `"Pemahaman Wacana (Reading)"`
- **Kemampuan Kuantitatif:** `"Deret Angka & Pola"`, `"Pecahan, Persen & Rasio"`, `"Rata-rata & Statistik"`, `"Aljabar & Soal Cerita"`, `"Kecepatan, Jarak, Waktu & Kerja"`, `"Peluang & Kombinatorik Dasar"`, `"Geometri Dasar"`
- **Kemampuan Penalaran:** `"Logika Proposisi (Jika–Maka)"`, `"Silogisme Kategoris"`, `"Kuantifikasi & Negasinya"`, `"Penalaran Analitis (Urutan & Posisi)"`, `"Penalaran Himpunan (Diagram Venn)"`
- **Bahasa Inggris:** `"Tenses & Verb Forms"`, `"Subject-Verb Agreement"`, `"Articles & Quantifiers"`, `"Prepositions & Collocations"`, `"Parallelism & Word Form"`, `"Conditionals (Pengandaian)"`, `"Reading & Vocabulary in Context"`

### Aturan MATEMATIKA (renderer offline, BUKAN MathJax)
- Apit rumus `$...$`. Backslash **dobel** di JSON: `"$\\frac{3}{4}$"`.
- Didukung: `\\frac`, `\\sqrt`, pangkat `x^2`/`x^{10}`, indeks `a_1`, `\\times \\div \\pm \\leq \\geq \\neq \\approx \\pi`. Pangkat/indeks >1 karakter pakai kurung.

### MUTU & REALISME (wajib)
1. Verbal: pakai kata serapan & istilah akademik (konvergen, ambigu, hipotesis). Analogi menguji **pola hubungan**.
2. Kuantitatif/Penalaran: tiap distraktor = **satu kesalahan umum** (salah operasi, lupa syarat, membalik implikasi).
3. Bahasa Inggris: teks bertema akademik; tipe reading = ide pokok/detail/inferensi/vocab-in-context.
4. Kunci **tak ambigu**, satu benar. Cek ulang hitungan.

## OUTPUT
HANYA JSON valid, tanpa pagar ```` ``` ````, tanpa teks lain, tanpa *trailing comma*. Pastikan jumlah & campuran kesulitan sesuai PARAMETER.

=== AKHIR PROMPT ===
