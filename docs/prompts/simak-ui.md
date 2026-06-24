# Prompt: Paket Soal — SIMAK UI (Sarjana / S1)

Tempel blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`. Output =
JSON murni siap **Input Soal → ⬆ Import**. Program: **SIMAK UI**.

=== MULAI PROMPT ===

Kamu penyusun soal **SIMAK UI jenjang Sarjana (S1)** yang ahli pedagogi &
psikometri. Buat **satu paket soal** dalam **JSON valid** sesuai skema persis di
bawah. **Tujuan utama: soal harus REALISTIS setara ujian asli SIMAK UI S1** —
tiru gaya, cakupan, dan tingkat kesulitan ujian masuk UI yang sesungguhnya
(setara/di atas SBMPTN).

## ACUAN ASLI (ikuti agar realistis)
SIMAK UI S1 terdiri dari:
- **Kemampuan Dasar (KD):** Matematika Dasar, Bahasa Indonesia, Bahasa Inggris — wajib untuk semua.
- **Kemampuan IPA** (Matematika IPA, Fisika, Kimia, Biologi) **atau Kemampuan IPS**
  (Ekonomi, Sejarah, Geografi, Sosiologi) — sesuai rumpun program studi.
- Soal pilihan ganda; kualitas penalaran tinggi, banyak soal aplikatif & analitis.

> **Cara pakai (BATCH → 1 paket lengkap):** generate **per mata uji** (20–30 soal/run)
> agar JSON tidak terpotong & mutu terjaga. Pakai `id` paket yang **sama persis**
> (`"simak-ui-01"`) di tiap run, lalu import dengan opsi **Tambahkan** — semua batch
> otomatis tergabung menjadi **satu paket utuh** di aplikasi.

## PARAMETER (boleh kuubah)
- Nama paket: "Tryout SIMAK UI — {EDIT}"
- Rumpun: {EDIT: "Kemampuan Dasar" | "IPA" | "IPS"}
- Hanya **satu mata uji per run**. Mata uji run ini: {EDIT, mis. "Matematika Dasar"}
- Jumlah soal run ini: {EDIT, mis. 20}
- Campuran kesulitan: ~25% Mudah (1), ~50% Sedang (2), ~25% Sulit (3).

## SKEMA WAJIB
```json
{
  "packages": [{
    "id": "simak-ui-01",
    "name": "<nama paket>",
    "program": "SIMAK UI",
    "mode": "sections",
    "durationMin": 100,
    "sectionMinutes": { "Matematika Dasar": 30, "Bahasa Indonesia": 20, "Bahasa Inggris": 25 },
    "shuffleQuestions": true,
    "shuffleOptions": true
  }],
  "questions": [ /* objek soal */ ]
}
```
> Bila membuat rumpun IPA/IPS, ganti `sectionMinutes` agar memuat mata uji terkait
> (mis. `"Matematika IPA": 30, "Fisika": 30, "Kimia": 30, "Biologi": 30`).

### Field tiap soal
- `packageId`: selalu `"simak-ui-01"`.
- `subject`: **persis** salah satu mata uji yang ada di `sectionMinutes` (mis. `"Matematika Dasar"`, `"Bahasa Indonesia"`, `"Bahasa Inggris"`, `"Fisika"`, dst).
- `subtopic`: teks topik spesifik (lihat saran di bawah). Konsisten ejaannya.
- `difficulty`: `1` | `2` | `3`.
- `text`, `options` (5, urut A–E), `answer` (`"A"`–`"E"`), `pembahasan` (1–3 kalimat).
- `optExplain`: 5 string sejajar — distraktor menyebut **kesalahan umum**.
- `steps`: langkah perhitungan untuk soal numerik (MTK/Fisika/Kimia); selain itu `[]`.
- JANGAN sertakan `id` & `image`.

### Saran SUB-TOPIK
- **Matematika Dasar:** Aljabar, Fungsi & Grafik, Pertidaksamaan, Statistika, Peluang, Logaritma & Eksponen, Barisan & Deret.
- **Bahasa Indonesia:** Ide Pokok, Simpulan & Inferensi, Ejaan & PUEBI, Kalimat Efektif, Makna Kata, Hubungan Antarparagraf.
- **Bahasa Inggris:** Reading (Main Idea/Detail/Inference), Vocabulary in Context, Structure/Grammar.
- **IPA:** sesuai topik kurikulum (mis. Fisika: Kinematika, Dinamika, Listrik; Kimia: Stoikiometri, Termokimia, Laju Reaksi; Biologi: Sel, Genetika, Ekologi).
- **IPS:** Ekonomi (Permintaan-Penawaran, Pasar), Sejarah, Geografi, Sosiologi sesuai topik kurikulum.

### Aturan MATEMATIKA (renderer offline, BUKAN MathJax)
- Apit rumus `$...$`. Backslash **dobel** di JSON: `"$\\frac{3}{4}$"`.
- Didukung: `\\frac`, `\\sqrt`, pangkat `x^2`/`x^{10}`, indeks `a_1`, `\\times \\div \\pm \\leq \\geq \\neq \\approx \\pi \\log`.

### MUTU & REALISME (wajib)
1. Setarakan kesulitan dengan ujian masuk UI — banyak soal aplikatif & multi-langkah.
2. Tiap distraktor = satu kesalahan konsep/operasi yang lazim, bukan acak.
3. Untuk soal teks (B.Indonesia/B.Inggris), sertakan paragraf utuh di `text` lalu pertanyaannya.
4. Kunci tak ambigu, satu benar. Verifikasi hitungan & fakta.

## OUTPUT
HANYA JSON valid, tanpa pagar ```` ``` ````, tanpa teks lain, tanpa *trailing comma*.

=== AKHIR PROMPT ===
