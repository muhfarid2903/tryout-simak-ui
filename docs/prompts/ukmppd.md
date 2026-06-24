# Prompt: Paket Soal — UKMPPD (Uji Kompetensi Mahasiswa Program Profesi Dokter)

Tempel blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`. Output =
JSON murni siap **Input Soal → ⬆ Import**. Program: **UKMPPD (Dokter)**.

=== MULAI PROMPT ===

Kamu penyusun soal **UKMPPD CBT** yang ahli kedokteran klinis & item-writing
sesuai blueprint SKDI. Buat **satu paket soal** dalam **JSON valid** sesuai skema
persis di bawah. **Tujuan utama: soal harus REALISTIS sesuai UKMPPD asli** —
yaitu **vignette klinis** (skenario pasien) dengan satu jawaban paling tepat,
menguji penalaran klinis (diagnosis, tata laksana, pemeriksaan penunjang),
**bukan** pertanyaan hafalan satu baris.

## ACUAN ASLI (ikuti agar realistis)
UKMPPD CBT ≈ **150 soal vignette, ~200 menit**. Tiap soal:
- Dibuka dengan **skenario**: usia & jenis kelamin, keluhan utama + durasi,
  riwayat singkat, **tanda vital**, temuan pemeriksaan fisik, dan bila relevan
  hasil lab/penunjang.
- Ditutup dengan **satu pertanyaan** (lead-in), mis. "Diagnosis yang paling tepat?",
  "Tata laksana awal yang tepat?", "Pemeriksaan penunjang yang dianjurkan?".
- 5 opsi homogen (sejenis), satu **paling tepat**.
- Sebaran disiplin mengikuti bobot SKDI (IPD & Anak porsi besar).

> **Cara pakai (BATCH → 1 paket lengkap):** generate **per disiplin** (15–25 soal/run)
> agar JSON tidak terpotong & mutu terjaga. Pakai `id` paket yang **sama persis**
> (`"ukmppd-01"`) di tiap run, lalu import dengan opsi **Tambahkan** — semua batch
> otomatis tergabung menjadi **satu paket utuh** (mis. 150 soal) di aplikasi.

## PARAMETER (boleh kuubah)
- Nama paket: "Tryout UKMPPD — {EDIT}"
- Hanya **satu disiplin per run**. Disiplin run ini: {EDIT, mis. "Ilmu Penyakit Dalam"}
- Jumlah soal run ini: {EDIT, mis. 20}
- Campuran kesulitan: ~30% Mudah (1, recall+1 langkah), ~50% Sedang (2), ~20% Sulit (3, multi-langkah/atypical).
- Sebaran lead-in: ~50% diagnosis, ~30% tata laksana, ~20% penunjang/komplikasi.

## SKEMA WAJIB
```json
{
  "packages": [{
    "id": "ukmppd-01",
    "name": "<nama paket>",
    "program": "UKMPPD (Dokter)",
    "mode": "sections",
    "durationMin": 100,
    "sectionMinutes": { "Ilmu Penyakit Dalam": 30, "Ilmu Kesehatan Anak": 20, "Bedah": 15, "Obstetri & Ginekologi": 20, "Neurologi": 15 },
    "shuffleQuestions": true,
    "shuffleOptions": true
  }],
  "questions": [ /* objek soal */ ]
}
```
> Sesuaikan `sectionMinutes` dengan disiplin yang kamu buat. Disiplin yang umum:
> `"Ilmu Penyakit Dalam"`, `"Ilmu Kesehatan Anak"`, `"Bedah"`,
> `"Obstetri & Ginekologi"`, `"Neurologi"`, `"Psikiatri"`, `"Kardiologi"`,
> `"THT-KL"`, `"Mata"`, `"Kulit & Kelamin"`, `"Forensik & Medikolegal"`,
> `"Ilmu Kesehatan Masyarakat"`.

### Field tiap soal
- `packageId`: selalu `"ukmppd-01"`.
- `subject`: **persis** nama disiplin (harus ada di `sectionMinutes`).
- `subtopic`: sistem/organ atau topik (mis. `"Endokrin"`, `"Respirologi"`, `"Kegawatdaruratan"`, `"Infeksi Tropis"`).
- `difficulty`: `1` | `2` | `3`.
- `text`: **vignette lengkap** — gunakan `\n` antar bagian. Sertakan tanda vital
  realistis (TD, nadi, RR, suhu) dan hasil penunjang bila perlu. Akhiri dengan lead-in.
- `options`: 5 string **homogen** (semua diagnosis, atau semua obat, dll), urut A–E.
- `answer`: huruf `"A"`–`"E"`.
- `pembahasan`: 1–4 kalimat — alasan kunci benar + petunjuk kunci (clue) dari vignette.
- `optExplain`: 5 string sejajar — untuk distraktor, sebut **mengapa keliru**
  (gejala pembeda yang tidak cocok / indikasi yang salah). Distraktor harus
  *near-miss* yang masuk akal secara klinis.
- `steps`: `[]` (umumnya tak perlu; boleh diisi alur penalaran klinis bila membantu).
- JANGAN sertakan `id` & `image`.

### MUTU & REALISME (wajib)
1. **Selalu vignette** — jangan soal hafalan satu baris. Data klinis cukup untuk menalar jawaban.
2. Opsi **homogen** & sejenis; satu paling tepat sesuai pedoman (PPK/Permenkes/standar terkini).
3. Tanda vital, dosis, dan nilai lab harus **plausibel & konsisten** dengan skenario.
4. Distraktor = diagnosis/tata laksana banding yang realistis, dibedakan oleh clue spesifik.
5. Hindari isu kontroversial/obat yang sudah usang. Kunci tak ambigu; verifikasi akurasi medis.
6. Bahasa Indonesia medis baku.

## OUTPUT
HANYA JSON valid, tanpa pagar ```` ``` ````, tanpa teks lain, tanpa *trailing comma*.

## CONTOH SATU SOAL (ikuti format ini persis)
```json
{
  "packageId": "ukmppd-01",
  "subject": "Ilmu Penyakit Dalam",
  "subtopic": "Endokrin",
  "difficulty": 2,
  "text": "Seorang laki-laki 52 tahun datang dengan keluhan sering buang air kecil, mudah haus, dan berat badan turun 6 kg dalam 2 bulan.\nTD 130/80 mmHg, nadi 88x/menit, RR 18x/menit, suhu 36,7°C.\nPemeriksaan: GDP 210 mg/dL, GD2PP 320 mg/dL.\nDiagnosis yang paling tepat adalah ...",
  "options": ["Diabetes melitus tipe 2", "Diabetes insipidus", "Hipertiroidisme", "Sindrom nefrotik", "Infeksi saluran kemih"],
  "answer": "A",
  "pembahasan": "Trias klasik (poliuria, polidipsia, BB turun) dengan GDP ≥126 dan GD2PP ≥200 memenuhi kriteria diagnosis DM tipe 2.",
  "optExplain": [
    "Tepat — kriteria glukosa darah terpenuhi dengan gejala klasik.",
    "Diabetes insipidus: poliuria ada, tetapi glukosa normal & ada polidipsia hipotonik — tidak cocok.",
    "Hipertiroid: BB turun bisa, tetapi tak menjelaskan hiperglikemia.",
    "Sindrom nefrotik: ditandai edema & proteinuria masif, bukan hiperglikemia.",
    "ISK: disuria/nyeri, bukan poliuria dengan hiperglikemia."
  ],
  "steps": []
}
```

=== AKHIR PROMPT ===
