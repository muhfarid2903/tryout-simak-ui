# Prompt Siap Pakai — per Subtes (semua paket)

Tiap blok di bawah **sudah lengkap & jumlah soalnya terisi** — tinggal salin
seluruh blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`, tempel
ke LLM kuat (Claude/GPT), lalu import hasil JSON-nya lewat **Input Soal → ⬆
Import → Tambahkan**.

Aturan umum yang sudah dibakukan di tiap blok:
- Output **HANYA JSON valid** (tanpa pagar ```` ``` ````, tanpa teks lain, tanpa *trailing comma*).
- Tiap soal: 5 `options` (A–E) + 5 `optExplain` sejajar; `answer` huruf `"A"`–`"E"`; tanpa `id`/`image`.
- Backslash LaTeX **dobel** di JSON: `"$\\frac{3}{4}$"`.
- Semua blok dalam satu program memakai **`id` paket yang sama** → import *Tambahkan* menyatukannya jadi satu paket.
- Untuk menambah soal, **jalankan blok yang sama berkali-kali** (id tetap) sampai target tercapai.

### Aturan penamaan paket (kapan menyatu vs terpisah)

Sistem menganggap dua paket **sama (soal digabung)** bila **`id` sama _ATAU_ `name`+`program` sama**. Konsekuensinya:

- **Menambah soal ke paket yang sama** → buat `id` **dan** `name` **sama persis** di semua blok (jalankan blok berkali-kali).
- **Membuat paket tryout baru yang terpisah** → buat `id` **BEDA dan** `name` **BEDA**. (Cukup salah satu beda, tapi paling aman bedakan keduanya.)

> ⚠️ Sering keliru: menyalin paket lalu hanya mengganti `id` tetapi `name` tetap sama → tetap **tergabung**, karena `name`+`program` masih cocok.

**Pola penomoran** — `program` selalu tetap (mis. `"SIMAK UI"`); yang dinaikkan hanya `id` & `name`:

| Paket | `id` | `name` |
|---|---|---|
| KD Paket 1 | `simak-ui-kd-01` | `Tryout SIMAK UI — Kemampuan Dasar Paket 1` |
| KD Paket 2 | `simak-ui-kd-02` | `Tryout SIMAK UI — Kemampuan Dasar Paket 2` |
| KD Paket 3 | `simak-ui-kd-03` | `Tryout SIMAK UI — Kemampuan Dasar Paket 3` |
| IPA Paket 2 | `simak-ui-ipa-02` | `Tryout SIMAK UI — IPA Paket 2` |

Dalam **satu** paket, 3 hal ini wajib sama persis di semua blok yang dijalankan untuk paket itu:
1. `id` paket · 2. `name` paket · 3. `packageId` di **setiap** soal (= `id` paket tsb).

Saat menaikkan nomor paket (`-01` → `-02`, `Paket 1` → `Paket 2`), **ganti ketiganya sekaligus**.

Daftar isi:
1. [SIMAK UI Pascasarjana](#1-simak-ui-pascasarjana) — 4 subtes
2. [SIMAK UI (Sarjana)](#2-simak-ui-sarjana) — Kemampuan Dasar / IPA / IPS
3. [TOEFL ITP](#3-toefl-itp) — 2 subtes
4. [SBMPTN (UTBK — TPS)](#4-sbmptn-utbk--tps) — 4 subtes
5. [UKMPPD (Dokter)](#5-ukmppd-dokter) — per disiplin

---

## 1. SIMAK UI Pascasarjana

`id` paket: **`simak-pasca-01`** · Target akhir ±360 soal (Verbal 90 · Kuantitatif 105 · Penalaran 75 · Inggris 90). Tiap blok = 25 soal; ulangi sampai target.

> Untuk paket tryout berikutnya yang **terpisah**, naikkan nomornya: `id` → `simak-pasca-02` dan `name` → `… Paket 2` (lihat [Aturan penamaan paket](#aturan-penamaan-paket-kapan-menyatu-vs-terpisah)).

### 1a. Kemampuan Verbal — 25 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI Pascasarjana (TPA)** ahli pedagogi & psikometri. Buat **25 soal** subtes **"Kemampuan Verbal"** sebagai **JSON valid**. Soal harus **REALISTIS setara ujian asli** (berpikir, bukan menghafal; kosakata & istilah akademik).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-pasca-01", "name": "Tryout SIMAK UI Pascasarjana Paket 1", "program": "SIMAK UI Pascasarjana", "mode": "sections", "durationMin": 170, "sectionMinutes": { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 50, "Kemampuan Penalaran": 40, "Bahasa Inggris": 50 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 25 objek soal */ ]
}
Tiap soal: { "packageId": "simak-pasca-01", "subject": "Kemampuan Verbal", "subtopic": <salah satu di bawah, persis>, "difficulty": 1|2|3, "text", "options": [5 string, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 string sejajar — distraktor sebut kesalahan berpikirnya], "steps": [] }. JANGAN sertakan `id`/`image`.
Sub-topik (pakai persis): `"Sinonim (Padanan Kata)"`, `"Antonim (Lawan Kata)"`, `"Analogi (Padanan Hubungan)"`, `"Pengelompokan / Pengecualian"`, `"Pemahaman Wacana (Reading)"`. Sebar ke ke-5 sub-topik.
Kesulitan: ~30% Mudah(1) / 50% Sedang(2) / 20% Sulit(3). Kunci tak ambigu, satu benar.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 25 soal**.
=== AKHIR PROMPT ===

### 1b. Kemampuan Kuantitatif — 25 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI Pascasarjana (TPA)** ahli pedagogi & psikometri. Buat **25 soal** subtes **"Kemampuan Kuantitatif"** sebagai **JSON valid**, **REALISTIS setara ujian asli** (deret, aritmetika, aljabar, geometri dasar; menekankan nalar).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-pasca-01", "name": "Tryout SIMAK UI Pascasarjana Paket 1", "program": "SIMAK UI Pascasarjana", "mode": "sections", "durationMin": 170, "sectionMinutes": { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 50, "Kemampuan Penalaran": 40, "Bahasa Inggris": 50 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 25 objek soal */ ]
}
Tiap soal: { "packageId": "simak-pasca-01", "subject": "Kemampuan Kuantitatif", "subtopic": <salah satu di bawah, persis>, "difficulty": 1|2|3, "text", "options": [5 string, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 string sejajar — distraktor sebut kesalahan operasi/syarat], "steps": [array langkah perhitungan] }. JANGAN sertakan `id`/`image`.
Sub-topik (pakai persis): `"Deret Angka & Pola"`, `"Pecahan, Persen & Rasio"`, `"Rata-rata & Statistik"`, `"Aljabar & Soal Cerita"`, `"Kecepatan, Jarak, Waktu & Kerja"`, `"Peluang & Kombinatorik Dasar"`, `"Geometri Dasar"`. Sebar ke-7 sub-topik.
Matematika: apit rumus `$...$`; backslash **dobel** di JSON (`"$\\frac{3}{4}$"`, `"$x^{2}$"`, `"$\\sqrt{5}$"`).
Kesulitan: ~30% Mudah(1) / 50% Sedang(2) / 20% Sulit(3). Tiap distraktor = satu kesalahan umum. **Verifikasi ulang setiap hitungan**; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 25 soal**.
=== AKHIR PROMPT ===

### 1c. Kemampuan Penalaran — 25 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI Pascasarjana (TPA)** ahli pedagogi & psikometri. Buat **25 soal** subtes **"Kemampuan Penalaran"** sebagai **JSON valid**, **REALISTIS setara ujian asli** (logika formal, analitis, silogisme).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-pasca-01", "name": "Tryout SIMAK UI Pascasarjana Paket 1", "program": "SIMAK UI Pascasarjana", "mode": "sections", "durationMin": 170, "sectionMinutes": { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 50, "Kemampuan Penalaran": 40, "Bahasa Inggris": 50 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 25 objek soal */ ]
}
Tiap soal: { "packageId": "simak-pasca-01", "subject": "Kemampuan Penalaran", "subtopic": <salah satu di bawah, persis>, "difficulty": 1|2|3, "text", "options": [5 string, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 string sejajar — distraktor sebut kesalahan nalar (membalik implikasi, overgeneralisasi)], "steps": [langkah penalaran bila berhitung; selain itu []] }. JANGAN sertakan `id`/`image`.
Sub-topik (pakai persis): `"Logika Proposisi (Jika–Maka)"`, `"Silogisme Kategoris"`, `"Kuantifikasi & Negasinya"`, `"Penalaran Analitis (Urutan & Posisi)"`, `"Penalaran Himpunan (Diagram Venn)"`. Sebar ke-5 sub-topik.
Kesulitan: ~30% Mudah(1) / 50% Sedang(2) / 20% Sulit(3). Hanya satu opsi yang benar-benar mengikuti premis; sisanya cacat nalar yang menggoda.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 25 soal**.
=== AKHIR PROMPT ===

### 1d. Bahasa Inggris — 25 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI Pascasarjana — Bahasa Inggris akademik (setara TOEFL)** yang ahli. Buat **25 soal** subtes **"Bahasa Inggris"** sebagai **JSON valid**, **REALISTIS** (structure & written expression + reading teks ilmiah).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-pasca-01", "name": "Tryout SIMAK UI Pascasarjana Paket 1", "program": "SIMAK UI Pascasarjana", "mode": "sections", "durationMin": 170, "sectionMinutes": { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 50, "Kemampuan Penalaran": 40, "Bahasa Inggris": 50 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 25 objek soal */ ]
}
Tiap soal: { "packageId": "simak-pasca-01", "subject": "Bahasa Inggris", "subtopic": <salah satu di bawah, persis>, "difficulty": 1|2|3, "text", "options": [5 string, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 string sejajar — sebut aturan tata bahasa yang dilanggar / mengapa inferensi tak didukung], "steps": [] }. Untuk reading, tulis **paragraf akademik utuh (4–7 kalimat)** lalu `\n` lalu pertanyaan. JANGAN sertakan `id`/`image`.
Sub-topik (pakai persis): `"Tenses & Verb Forms"`, `"Subject-Verb Agreement"`, `"Articles & Quantifiers"`, `"Prepositions & Collocations"`, `"Parallelism & Word Form"`, `"Conditionals (Pengandaian)"`, `"Reading & Vocabulary in Context"`. Sebar ke-7 sub-topik.
Kesulitan: ~30% Mudah(1) / 50% Sedang(2) / 20% Sulit(3). Register akademik formal; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 25 soal**.
=== AKHIR PROMPT ===

---

## 2. SIMAK UI (Sarjana)

Pisahkan jadi 3 paket sesuai rumpun (id berbeda): **Kemampuan Dasar** (`simak-ui-kd-01`), **IPA** (`simak-ui-ipa-01`), **IPS** (`simak-ui-ips-01`). Tiap blok = 20 soal.

> Untuk paket tryout berikutnya yang **terpisah**, naikkan nomornya: mis. `simak-ui-kd-02` + `name` → `… Paket 2` (lihat [Aturan penamaan paket](#aturan-penamaan-paket-kapan-menyatu-vs-terpisah)).

### 2a. Matematika Dasar (Kemampuan Dasar) — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI S1 — Kemampuan Dasar** yang ahli. Buat **20 soal** mata uji **"Matematika Dasar"** sebagai **JSON valid**, **REALISTIS setara ujian masuk UI** (aplikatif & multi-langkah, setara/di atas SBMPTN).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-ui-kd-01", "name": "Tryout SIMAK UI — Kemampuan Dasar Paket 1", "program": "SIMAK UI", "mode": "sections", "durationMin": 75, "sectionMinutes": { "Matematika Dasar": 30, "Bahasa Indonesia": 20, "Bahasa Inggris": 25 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "simak-ui-kd-01", "subject": "Matematika Dasar", "subtopic": <topik spesifik>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor sebut kesalahan konsep/operasi], "steps": [langkah perhitungan] }. JANGAN sertakan `id`/`image`.
Saran sub-topik: Aljabar, Fungsi & Grafik, Pertidaksamaan, Statistika, Peluang, Logaritma & Eksponen, Barisan & Deret.
Matematika: apit `$...$`; backslash **dobel** (`"$\\frac{3}{4}$"`, `"$\\log$"`, `"$x^{2}$"`).
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). **Verifikasi hitungan**; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 2b. Bahasa Indonesia (Kemampuan Dasar) — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI S1 — Kemampuan Dasar** yang ahli. Buat **20 soal** mata uji **"Bahasa Indonesia"** sebagai **JSON valid**, **REALISTIS setara ujian masuk UI**.
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-ui-kd-01", "name": "Tryout SIMAK UI — Kemampuan Dasar Paket 1", "program": "SIMAK UI", "mode": "sections", "durationMin": 75, "sectionMinutes": { "Matematika Dasar": 30, "Bahasa Indonesia": 20, "Bahasa Inggris": 25 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "simak-ui-kd-01", "subject": "Bahasa Indonesia", "subtopic": <topik spesifik>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor sebut kesalahan umum], "steps": [] }. Untuk soal teks, sertakan **paragraf utuh** di `text` lalu `\n` lalu pertanyaan. JANGAN sertakan `id`/`image`.
Saran sub-topik: Ide Pokok, Simpulan & Inferensi, Ejaan & PUEBI, Kalimat Efektif, Makna Kata, Hubungan Antarparagraf.
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Kunci tak ambigu, satu benar.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 2c. Bahasa Inggris (Kemampuan Dasar) — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI S1 — Kemampuan Dasar** yang ahli. Buat **20 soal** mata uji **"Bahasa Inggris"** sebagai **JSON valid**, **REALISTIS setara ujian masuk UI** (grammar + reading akademik).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-ui-kd-01", "name": "Tryout SIMAK UI — Kemampuan Dasar Paket 1", "program": "SIMAK UI", "mode": "sections", "durationMin": 75, "sectionMinutes": { "Matematika Dasar": 30, "Bahasa Indonesia": 20, "Bahasa Inggris": 25 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "simak-ui-kd-01", "subject": "Bahasa Inggris", "subtopic": <Reading / Vocabulary in Context / Structure>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — sebut aturan tata bahasa yang dilanggar / mengapa pilihan tak cocok], "steps": [] }. Untuk reading, sertakan **paragraf utuh** lalu `\n` lalu pertanyaan. JANGAN sertakan `id`/`image`.
Saran sub-topik: Reading (Main Idea/Detail/Inference), Vocabulary in Context, Structure/Grammar.
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Register akademik; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 2d. Rumpun IPA — 20 soal (ganti `subject` per mata uji)

> Mata uji IPA: **Matematika IPA**, **Fisika**, **Kimia**, **Biologi**. Salin blok ini 4×, tiap kali ganti `"subject"` (di paket & tiap soal) ke salah satu mata uji.

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI S1 — Kemampuan IPA** yang ahli. Buat **20 soal** mata uji **"Matematika IPA"** (ganti ke Fisika/Kimia/Biologi bila perlu) sebagai **JSON valid**, **REALISTIS setara ujian masuk UI** (aplikatif & analitis).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-ui-ipa-01", "name": "Tryout SIMAK UI — IPA Paket 1", "program": "SIMAK UI", "mode": "sections", "durationMin": 120, "sectionMinutes": { "Matematika IPA": 30, "Fisika": 30, "Kimia": 30, "Biologi": 30 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "simak-ui-ipa-01", "subject": "Matematika IPA", "subtopic": <topik kurikulum spesifik>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor = kesalahan konsep/operasi lazim], "steps": [langkah untuk soal numerik; selain itu []] }. JANGAN sertakan `id`/`image`.
Saran sub-topik: Fisika (Kinematika, Dinamika, Listrik, Gelombang); Kimia (Stoikiometri, Termokimia, Laju Reaksi, Kesetimbangan); Biologi (Sel, Genetika, Ekologi, Metabolisme); Matematika IPA (Limit/Turunan, Integral, Trigonometri, Vektor, Peluang).
Matematika: apit `$...$`; backslash **dobel** (`"$\\frac{3}{4}$"`, `"$x^{2}$"`).
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). **Verifikasi hitungan & fakta**; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 2e. Rumpun IPS — 20 soal (ganti `subject` per mata uji)

> Mata uji IPS: **Ekonomi**, **Sejarah**, **Geografi**, **Sosiologi**. Salin blok ini 4×, tiap kali ganti `"subject"`.

=== MULAI PROMPT ===
Kamu penyusun soal **SIMAK UI S1 — Kemampuan IPS** yang ahli. Buat **20 soal** mata uji **"Ekonomi"** (ganti ke Sejarah/Geografi/Sosiologi bila perlu) sebagai **JSON valid**, **REALISTIS setara ujian masuk UI** (analitis & aplikatif).
Output objek tunggal persis:
{
  "packages": [{ "id": "simak-ui-ips-01", "name": "Tryout SIMAK UI — IPS Paket 1", "program": "SIMAK UI", "mode": "sections", "durationMin": 90, "sectionMinutes": { "Ekonomi": 30, "Sejarah": 20, "Geografi": 20, "Sosiologi": 20 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "simak-ui-ips-01", "subject": "Ekonomi", "subtopic": <topik kurikulum spesifik>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor = miskonsepsi lazim], "steps": [] }. JANGAN sertakan `id`/`image`.
Saran sub-topik: Ekonomi (Permintaan-Penawaran, Pasar, Kebijakan, Akuntansi dasar); Sejarah (Pergerakan Nasional, Kemerdekaan, Orde); Geografi (Litosfer, Atmosfer, Penginderaan Jauh, SIG); Sosiologi (Interaksi, Stratifikasi, Perubahan Sosial).
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Kunci tak ambigu; verifikasi fakta.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

---

## 3. TOEFL ITP

`id` paket: **`toefl-itp-01`**. Blueprint: Structure & Written Expression 40 item · Reading Comprehension 50 item. Tiap blok di bawah satu kali jalan; ulangi (2×) untuk mencapai blueprint penuh.

> Untuk paket tryout berikutnya yang **terpisah**, naikkan nomornya: `id` → `toefl-itp-02` dan `name` → `… Paket 2` (lihat [Aturan penamaan paket](#aturan-penamaan-paket-kapan-menyatu-vs-terpisah)).

### 3a. Structure & Written Expression — 20 item

=== MULAI PROMPT ===
You are an expert **TOEFL ITP** item writer (ETS-style). Produce **exactly 20 items** for the subtest **"Structure & Written Expression"** as **valid JSON**. Items MUST be **REALISTIC and authentic to the actual TOEFL ITP** (formal academic register; one clean grammar point each).
Output a single object exactly:
{
  "packages": [{ "id": "toefl-itp-01", "name": "Tryout TOEFL ITP Paket 1", "program": "TOEFL", "mode": "sections", "durationMin": 80, "sectionMinutes": { "Structure & Written Expression": 25, "Reading Comprehension": 55 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* exactly 20 item objects */ ]
}
Each item: { "packageId": "toefl-itp-01", "subject": "Structure & Written Expression", "subtopic": <from list>, "difficulty": 1|2|3, "text", "options": [5 strings A–E], "answer": "A"–"E", "pembahasan": "1–3 sentences", "optExplain": [5 parallel — name the grammar rule violated by each distractor], "steps": [] }. For *Structure*, write the sentence with a blank `___`. For *Written Expression*, write the sentence marking four parts `(A) … (B) … (C) … (D) …` and ask to identify the error (5th option may be "No error" if appropriate). Do NOT include `id`/`image`.
Sub-topics (use exactly): `"Subject-Verb Agreement"`, `"Tenses & Verb Forms"`, `"Parallelism"`, `"Articles & Determiners"`, `"Prepositions"`, `"Word Form / Word Choice"`, `"Clauses & Conjunctions"`, `"Reduced & Relative Clauses"`, `"Comparisons"`, `"Error Identification"`.
Difficulty mix: ~30% Easy(1) / 50% Medium(2) / 20% Hard(3). Single unambiguous key; verify carefully.
OUTPUT: ONLY valid JSON — no code fences, no extra text, no trailing comma. Produce **exactly 20 items**.
=== AKHIR PROMPT ===

### 3b. Reading Comprehension — 25 item

=== MULAI PROMPT ===
You are an expert **TOEFL ITP** item writer (ETS-style). Produce **exactly 25 items** for the subtest **"Reading Comprehension"** as **valid JSON**, **REALISTIC and authentic** (self-contained academic passages: science/history/nature).
Output a single object exactly:
{
  "packages": [{ "id": "toefl-itp-01", "name": "Tryout TOEFL ITP Paket 1", "program": "TOEFL", "mode": "sections", "durationMin": 80, "sectionMinutes": { "Structure & Written Expression": 25, "Reading Comprehension": 55 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* exactly 25 item objects */ ]
}
Each item: { "packageId": "toefl-itp-01", "subject": "Reading Comprehension", "subtopic": <from list>, "difficulty": 1|2|3, "text", "options": [5 strings A–E], "answer": "A"–"E", "pembahasan": "1–3 sentences", "optExplain": [5 parallel — why each distractor is unsupported by the passage], "steps": [] }. In `text`, put the **full passage (4–7 sentences)**, then a blank line (`\n`), then the question. You may reuse one passage for 2–3 consecutive questions. Do NOT include `id`/`image`.
Sub-topics (use exactly): `"Main Idea"`, `"Stated Detail"`, `"Inference"`, `"Vocabulary in Context"`, `"Reference (Pronoun)"`, `"Author's Purpose & Tone"`, `"NOT/EXCEPT"`, `"Restatement / Paraphrase"`.
Difficulty mix: ~30% Easy(1) / 50% Medium(2) / 20% Hard(3). Vocabulary-in-context: all options plausible meanings, only one fits. Single unambiguous key.
OUTPUT: ONLY valid JSON — no code fences, no extra text, no trailing comma. Produce **exactly 25 items**.
=== AKHIR PROMPT ===

---

## 4. SBMPTN (UTBK — TPS)

`id` paket: **`sbmptn-tps-01`**.

> Untuk paket tryout berikutnya yang **terpisah**, naikkan nomornya: `id` → `sbmptn-tps-02` dan `name` → `… Paket 2` (lihat [Aturan penamaan paket](#aturan-penamaan-paket-kapan-menyatu-vs-terpisah)).

### 4a. Penalaran Umum — 25 soal

=== MULAI PROMPT ===
Kamu penyusun soal **UTBK-SBMPTN TPS** ahli psikometri. Buat **25 soal** subtes **"Penalaran Umum"** sebagai **JSON valid**, **REALISTIS sesuai UTBK terkini** (berbasis stimulus tabel/grafik/teks; menekankan nalar).
Output objek tunggal persis:
{
  "packages": [{ "id": "sbmptn-tps-01", "name": "Tryout SBMPTN (UTBK) — TPS Paket 1", "program": "SBMPTN", "mode": "sections", "durationMin": 90, "sectionMinutes": { "Penalaran Umum": 30, "Pengetahuan dan Pemahaman Umum": 15, "Pemahaman Bacaan dan Menulis": 25, "Pengetahuan Kuantitatif": 20 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 25 objek soal */ ]
}
Tiap soal: { "packageId": "sbmptn-tps-01", "subject": "Penalaran Umum", "subtopic": <dari daftar, persis>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor sebut kesalahan nalar (overgeneralisasi, membalik implikasi, salah baca data)], "steps": [bila kuantitatif; selain itu []] }. Untuk soal berstimulus, tulis teks/tabel dalam bentuk teks lalu `\n` lalu pertanyaan. JANGAN sertakan `id`/`image`.
Sub-topik (persis): `"Penalaran Induktif (Pola)"`, `"Penalaran Deduktif (Silogisme)"`, `"Penalaran Kuantitatif"`, `"Analisis Tabel & Grafik"`, `"Kesimpulan Logis"`.
Untuk soal "kesimpulan PASTI benar": hanya satu opsi yang benar-benar mengikuti premis; sisanya overgeneralisasi/bertentangan.
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 25 soal**.
=== AKHIR PROMPT ===

### 4b. Pengetahuan dan Pemahaman Umum — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **UTBK-SBMPTN TPS** ahli psikometri. Buat **20 soal** subtes **"Pengetahuan dan Pemahaman Umum"** sebagai **JSON valid**, **REALISTIS sesuai UTBK terkini**.
Output objek tunggal persis:
{
  "packages": [{ "id": "sbmptn-tps-01", "name": "Tryout SBMPTN (UTBK) — TPS Paket 1", "program": "SBMPTN", "mode": "sections", "durationMin": 90, "sectionMinutes": { "Penalaran Umum": 30, "Pengetahuan dan Pemahaman Umum": 15, "Pemahaman Bacaan dan Menulis": 25, "Pengetahuan Kuantitatif": 20 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "sbmptn-tps-01", "subject": "Pengetahuan dan Pemahaman Umum", "subtopic": <dari daftar, persis>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor sebut kesalahan makna/konteks], "steps": [] }. JANGAN sertakan `id`/`image`.
Sub-topik (persis): `"Makna Kata & Kosakata"`, `"Hubungan Makna"`, `"Melengkapi Kalimat"`, `"Ide Pokok"`.
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Kunci tak ambigu, satu benar.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 4c. Pemahaman Bacaan dan Menulis — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **UTBK-SBMPTN TPS** ahli psikometri. Buat **20 soal** subtes **"Pemahaman Bacaan dan Menulis"** sebagai **JSON valid**, **REALISTIS sesuai UTBK terkini** (bacaan + perbaikan kalimat/ejaan).
Output objek tunggal persis:
{
  "packages": [{ "id": "sbmptn-tps-01", "name": "Tryout SBMPTN (UTBK) — TPS Paket 1", "program": "SBMPTN", "mode": "sections", "durationMin": 90, "sectionMinutes": { "Penalaran Umum": 30, "Pengetahuan dan Pemahaman Umum": 15, "Pemahaman Bacaan dan Menulis": 25, "Pengetahuan Kuantitatif": 20 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "sbmptn-tps-01", "subject": "Pemahaman Bacaan dan Menulis", "subtopic": <dari daftar, persis>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor sebut pelanggaran kaidah (PUEBI, kepaduan)], "steps": [] }. Sertakan **bacaan/kalimat bernomor** di `text` lalu `\n` lalu pertanyaan. JANGAN sertakan `id`/`image`.
Sub-topik (persis): `"Ide Pokok & Simpulan"`, `"Kalimat Efektif"`, `"Ejaan & PUEBI"`, `"Kepaduan Paragraf"`, `"Kata Penghubung"`.
Kesulitan: ~25% Mudah(1) / 50% Sedang(2) / 25% Sulit(3). Kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

### 4d. Pengetahuan Kuantitatif — 20 soal

=== MULAI PROMPT ===
Kamu penyusun soal **UTBK-SBMPTN TPS** ahli psikometri. Buat **20 soal** subtes **"Pengetahuan Kuantitatif"** sebagai **JSON valid**, **REALISTIS sesuai UTBK terkini** (termasuk soal **kecukupan data**).
Output objek tunggal persis:
{
  "packages": [{ "id": "sbmptn-tps-01", "name": "Tryout SBMPTN (UTBK) — TPS Paket 1", "program": "SBMPTN", "mode": "sections", "durationMin": 90, "sectionMinutes": { "Penalaran Umum": 30, "Pengetahuan dan Pemahaman Umum": 15, "Pemahaman Bacaan dan Menulis": 25, "Pengetahuan Kuantitatif": 20 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat 20 objek soal */ ]
}
Tiap soal: { "packageId": "sbmptn-tps-01", "subject": "Pengetahuan Kuantitatif", "subtopic": <dari daftar, persis>, "difficulty": 1|2|3, "text", "options": [5, A–E], "answer": "A"–"E", "pembahasan": "1–3 kalimat", "optExplain": [5 sejajar — distraktor = kesalahan operasi/syarat], "steps": [langkah perhitungan] }. JANGAN sertakan `id`/`image`.
Sub-topik (persis): `"Aritmetika & Persen"`, `"Aljabar"`, `"Geometri & Pengukuran"`, `"Statistika & Peluang"`, `"Kecukupan Data"`.
Untuk **Kecukupan Data**, pakai 5 opsi standar: (A) pernyataan 1 saja cukup, (B) pernyataan 2 saja cukup, (C) keduanya bersama cukup, (D) masing-masing cukup, (E) keduanya tidak cukup.
Matematika: apit `$...$`; backslash **dobel** (`"$\\frac{3}{4}$"`). Kesulitan: ~25%/50%/25%. **Verifikasi hitungan**; kunci tak ambigu.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat 20 soal**.
=== AKHIR PROMPT ===

---

## 5. UKMPPD (Dokter)

`id` paket: **`ukmppd-01`**. Tiap soal = **vignette klinis** (skenario pasien) dengan satu jawaban paling tepat. Blok per disiplin di bawah memakai `sectionMinutes` yang sama agar semua tergabung ke satu paket ±150 soal. Ganti `subject` & jumlah sesuai kebutuhan.

> Untuk paket tryout berikutnya yang **terpisah**, naikkan nomornya: `id` → `ukmppd-02` dan `name` → `… Paket 2` (lihat [Aturan penamaan paket](#aturan-penamaan-paket-kapan-menyatu-vs-terpisah)).

> Disiplin & jumlah saran (mengikuti bobot SKDI): Ilmu Penyakit Dalam 25 · Ilmu Kesehatan Anak 25 · Bedah 15 · Obstetri & Ginekologi 20 · Neurologi 15 · Psikiatri 10 · Kardiologi 10 · THT-KL 10 · Mata 10 · Kulit & Kelamin 10 · Forensik & Medikolegal 10 · Ilmu Kesehatan Masyarakat 10.

### Blok generik UKMPPD (ganti `subject` & jumlah `N`)

=== MULAI PROMPT ===
Kamu penyusun soal **UKMPPD CBT** ahli kedokteran klinis & item-writing sesuai blueprint SKDI. Buat **20 soal** (ganti **N** sesuai disiplin) disiplin **"Ilmu Penyakit Dalam"** (ganti `subject` sesuai kebutuhan) sebagai **JSON valid**. Tiap soal = **vignette klinis REALISTIS** (skenario pasien lengkap), satu jawaban paling tepat — **bukan** hafalan satu baris.
Output objek tunggal persis:
{
  "packages": [{ "id": "ukmppd-01", "name": "Tryout UKMPPD Paket 1", "program": "UKMPPD (Dokter)", "mode": "sections", "durationMin": 175, "sectionMinutes": { "Ilmu Penyakit Dalam": 35, "Ilmu Kesehatan Anak": 30, "Bedah": 20, "Obstetri & Ginekologi": 25, "Neurologi": 15, "Psikiatri": 10, "Kardiologi": 10, "THT-KL": 10, "Mata": 10, "Kulit & Kelamin": 10, "Forensik & Medikolegal": 5, "Ilmu Kesehatan Masyarakat": 5 }, "shuffleQuestions": true, "shuffleOptions": true }],
  "questions": [ /* tepat N objek soal */ ]
}
Tiap soal: { "packageId": "ukmppd-01", "subject": "Ilmu Penyakit Dalam", "subtopic": <sistem/organ, mis. "Endokrin", "Respirologi", "Kegawatdaruratan", "Infeksi Tropis">, "difficulty": 1|2|3, "text": "<vignette lengkap, pakai \\n antar bagian>", "options": [5 string **homogen** A–E], "answer": "A"–"E", "pembahasan": "1–4 kalimat: alasan kunci benar + clue dari vignette", "optExplain": [5 sejajar — distraktor sebut mengapa keliru (gejala pembeda yang tak cocok), harus *near-miss* klinis], "steps": [] }. JANGAN sertakan `id`/`image`.
Isi `text`: usia & jenis kelamin, keluhan utama + durasi, riwayat singkat, **tanda vital** (TD, nadi, RR, suhu) realistis, temuan pemeriksaan fisik, hasil lab/penunjang bila relevan, lalu **satu lead-in** (mis. "Diagnosis yang paling tepat?", "Tata laksana awal yang tepat?", "Pemeriksaan penunjang yang dianjurkan?").
Kesulitan: ~30% Mudah(1) / 50% Sedang(2) / 20% Sulit(3). Sebaran lead-in ~50% diagnosis / 30% tata laksana / 20% penunjang-komplikasi.
Opsi **homogen** (semua diagnosis, atau semua obat, dll); satu paling tepat sesuai PPK/Permenkes terkini. Tanda vital, dosis & nilai lab **plausibel & konsisten**. Hindari obat usang. Kunci tak ambigu; verifikasi akurasi medis. Bahasa Indonesia medis baku.
OUTPUT: HANYA JSON valid — tanpa pagar ```, tanpa teks lain, tanpa trailing comma. Hasilkan **tepat N soal**.
=== AKHIR PROMPT ===

> Disiplin lain (salin nilai `subject` persis): `"Ilmu Kesehatan Anak"`, `"Bedah"`, `"Obstetri & Ginekologi"`, `"Neurologi"`, `"Psikiatri"`, `"Kardiologi"`, `"THT-KL"`, `"Mata"`, `"Kulit & Kelamin"`, `"Forensik & Medikolegal"`, `"Ilmu Kesehatan Masyarakat"`.
