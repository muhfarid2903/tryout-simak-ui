# Prompt: Generate 1 Paket Soal (siap import)

Tempel **seluruh** teks di bawah `=== MULAI PROMPT ===` ke LLM mana pun yang kuat
(Claude/GPT). Edit hanya bagian **PARAMETER**. Output-nya berupa JSON murni yang
bisa langsung di-import lewat **Input Soal → ⬆ Import** di aplikasi.

---

=== MULAI PROMPT ===

Kamu adalah penyusun soal tryout **SIMAK UI Pascasarjana (S2/S3)** yang ahli
pedagogi & psikometri. Buat **satu paket soal lengkap** dalam **JSON valid**
sesuai skema persis di bawah. Soal harus realistis setara SIMAK UI, bukan
soal SD/SMP.

## PARAMETER (boleh aku ubah)
- Nama paket: "Tryout SIMAK UI — Latihan {EDIT}"
- Jumlah & distribusi soal — **menyamai ukuran asli SIMAK UI Pascasarjana**
  (TPA = 100 soal, 2 jam: Verbal 30 menit, Kuantitatif 50 menit, Logika 40 menit;
  Bahasa Inggris terpisah):
  - Kemampuan Verbal: 30
  - Kemampuan Kuantitatif: 40
  - Kemampuan Penalaran: 30   (total TPA = 100)
  - Bahasa Inggris: 40        (perkiraan — sesuaikan dengan info resmimu)
- Campuran kesulitan tiap mata uji: ~30% Mudah (1), ~50% Sedang (2), ~20% Sulit (3).
- Fokus topik khusus (opsional): {kosongkan = sebar merata}

> **Catatan jumlah:** TPA 100 soal itu **angka resmi yang umum dikutip**;
> pembagian per sub-tes (30/40/30) dan jumlah Bahasa Inggris (40) adalah
> **perkiraan wajar** — sumber publik tidak merinci keduanya. Ubah bila kamu
> punya data resmi.
>
> **Cara pakai untuk paket sebesar ini (disarankan BATCH):** 140 soal sekali
> generate akan menurunkan mutu & sering kena batas output LLM. Jalankan prompt
> **per mata uji** (ubah PARAMETER agar hanya satu mata uji per run), lalu di
> aplikasi Import → **Tambahkan** untuk menggabung semuanya ke satu paket.
> Saat batch, pakai `id` paket yang **sama persis** di tiap run agar tergabung.

## SKEMA WAJIB
```json
{
  "packages": [
    {
      "id": "paket-latihan-01",
      "name": "<nama paket>",
      "program": "SIMAK UI Pascasarjana",
      "mode": "sections",
      "durationMin": 170,
      "sectionMinutes": {
        "Kemampuan Verbal": 30,
        "Kemampuan Kuantitatif": 50,
        "Kemampuan Penalaran": 40,
        "Bahasa Inggris": 50
      },
      "shuffleQuestions": true,
      "shuffleOptions": true
    }
  ],
  "questions": [ /* objek soal, lihat aturan field */ ]
}
```

### Field tiap soal
| Field | Wajib | Aturan |
|------|------|--------|
| `packageId` | ya | Selalu `"paket-latihan-01"` (sama dengan `id` paket). |
| `subject` | ya | **Persis salah satu**: `"Kemampuan Verbal"`, `"Kemampuan Kuantitatif"`, `"Kemampuan Penalaran"`, `"Bahasa Inggris"`. |
| `subtopic` | ya | **Persis** dari daftar sub-topik mata uji terkait (lihat di bawah). Salin karakter demi karakter. |
| `difficulty` | ya | Angka `1` (Mudah), `2` (Sedang), atau `3` (Sulit). |
| `text` | ya | Teks soal. Untuk reading/structure Inggris, tulis kalimat/teks penuh; gunakan `\n` untuk baris baru. |
| `options` | ya | Array **5** pilihan (string). Urutan = A,B,C,D,E. |
| `answer` | ya | Huruf kunci `"A"`–`"E"`. Satu jawaban benar yang **tak ambigu**. |
| `pembahasan` | ya | Penjelasan ringkas mengapa kunci benar (1–3 kalimat). |
| `optExplain` | ya | Array **5** string, sejajar `options`: kenapa tiap pilihan benar/salah. Untuk distraktor, sebut **kesalahan berpikir** yang membuatnya menggoda. |
| `steps` | hanya numerik & logika | Array string, satu langkah per elemen, untuk soal Kuantitatif & Penalaran berhitung. Kosongkan (`[]`) untuk verbal/vocab. |

> JANGAN sertakan field `id` pada soal (biar aplikasi yang membuat). JANGAN
> sertakan `image`. JANGAN tambah field lain.

### Daftar SUB-TOPIK resmi (salin persis)
**Kemampuan Verbal:**
- `"Sinonim (Padanan Kata)"`
- `"Antonim (Lawan Kata)"`
- `"Analogi (Padanan Hubungan)"`
- `"Pengelompokan / Pengecualian"`
- `"Pemahaman Wacana (Reading)"`

**Kemampuan Kuantitatif:**
- `"Deret Angka & Pola"`
- `"Pecahan, Persen & Rasio"`
- `"Rata-rata & Statistik"`
- `"Aljabar & Soal Cerita"`
- `"Kecepatan, Jarak, Waktu & Kerja"`
- `"Peluang & Kombinatorik Dasar"`
- `"Geometri Dasar"`

**Kemampuan Penalaran:**
- `"Logika Proposisi (Jika–Maka)"`
- `"Silogisme Kategoris"`
- `"Kuantifikasi & Negasinya"`
- `"Penalaran Analitis (Urutan & Posisi)"`
- `"Penalaran Himpunan (Diagram Venn)"`

**Bahasa Inggris:**
- `"Tenses & Verb Forms"`
- `"Subject-Verb Agreement"`
- `"Articles & Quantifiers"`
- `"Prepositions & Collocations"`
- `"Parallelism & Word Form"`
- `"Conditionals (Pengandaian)"`
- `"Reading & Vocabulary in Context"`

### Aturan MATEMATIKA (renderer offline, BUKAN MathJax)
- Apit rumus dengan `$...$`.
- Di dalam string JSON, **setiap backslash ditulis dobel**: tulis `"$\\frac{3}{4}$"`, bukan `"$\frac{3}{4}$"`.
- Didukung: pecahan `\\frac{a}{b}`, akar `\\sqrt{x}` / `\\sqrt[3]{x}`, pangkat `x^2` / `x^{10}`, indeks `a_1`, dan simbol: `\\times \\div \\pm \\leq \\geq \\neq \\approx \\pi \\sum \\in \\cup \\cap \\rightarrow \\infty \\angle \\deg` dll.
- Untuk pangkat/indeks lebih dari 1 karakter, pakai kurung: `x^{12}`, `a_{n+1}`.
- Jangan pakai perintah LaTeX di luar daftar ini (mis. matriks, `\\begin{...}`, `\\int_a^b` dengan batas) — tidak akan tampil.

### MUTU SOAL (pedagogi — wajib)
1. **Verbal**: utamakan kata serapan & istilah ilmiah/akademik (mis. *konvergen, ambigu, hipotesis*). Analogi = uji **pola hubungan**, bukan hafalan.
2. **Kuantitatif/Penalaran**: tiap distraktor mencerminkan **satu kesalahan umum** (salah operasi, lupa syarat, membalik implikasi). Hindari distraktor acak.
3. **Bahasa Inggris**: setara TOEFL — structure (tense, agreement, paralelisme, preposisi), vocabulary-in-context, reading (ide pokok/detail/inferensi).
4. **Reading**: jika butuh teks, tulis 1 paragraf 4–7 kalimat di `text`, lalu pertanyaannya. (Saat ini 1 teks = 1 soal.)
5. **Kunci tak ambigu**, hanya satu benar. Dilarang "semua benar"/"tidak ada yang benar" kecuali memang materi ujinya.
6. **Jujur & akurat**: cek ulang hitungan dan kebenaran kunci.

## OUTPUT
- Keluarkan **HANYA JSON valid**, tanpa pagar ```` ``` ````, tanpa komentar, tanpa teks pembuka/penutup.
- Tidak boleh ada koma menggantung (*trailing comma*).
- Pastikan jumlah & distribusi soal sesuai PARAMETER, dan tiap mata uji punya campuran kesulitan sesuai target.

## CONTOH SATU SOAL (ikuti format ini persis)
```json
{
  "packageId": "paket-latihan-01",
  "subject": "Kemampuan Kuantitatif",
  "subtopic": "Aljabar & Soal Cerita",
  "difficulty": 3,
  "text": "Jika $x^2 = 144$ dan $x > 0$, maka nilai $\\sqrt{x} \\times 3$ adalah ...",
  "options": ["$36$", "$\\sqrt{12}$", "$3\\sqrt{12}$", "$12$", "$6\\sqrt{3}$"],
  "answer": "C",
  "pembahasan": "Dari $x^2 = 144$ dan $x>0$ diperoleh $x = 12$, sehingga $\\sqrt{x}\\times 3 = 3\\sqrt{12}$.",
  "optExplain": [
    "Keliru: mengira $\\sqrt{x}\\times 3 = x\\times 3 = 36$ (lupa akar).",
    "Hanya $\\sqrt{12}$ — lupa mengalikan 3.",
    "Tepat — $x=12$, lalu $3\\sqrt{12}$.",
    "Itu nilai $x$, bukan yang ditanya.",
    "Salah menyederhanakan $3\\sqrt{12}$ menjadi $6\\sqrt{3}$ tanpa alasan tepat di konteks ini."
  ],
  "steps": [
    "Diketahui $x^2 = 144$ dan $x > 0$.",
    "Maka $x = \\sqrt{144} = 12$.",
    "Substitusi: $\\sqrt{x}\\times 3 = \\sqrt{12}\\times 3 = 3\\sqrt{12}$.",
    "Jawaban: C."
  ]
}
```

Sekarang hasilkan paket JSON lengkap sesuai PARAMETER. Sebelum mengeluarkan,
**periksa sendiri**: (a) JSON valid & tanpa trailing comma, (b) tiap `subject`
& `subtopic` persis dari daftar, (c) tiap soal 5 opsi + 5 `optExplain`,
(d) backslash LaTeX dobel, (e) jumlah & campuran kesulitan sesuai.

=== AKHIR PROMPT ===

---

## Setelah dapat JSON
1. Salin seluruh output JSON ke sebuah file `.json` (atau langsung di clipboard).
2. Di aplikasi: **Input Soal → ⬆ Import** → tempel/pilih file → pilih
   *Tambahkan* (bukan ganti) bila ingin menggabung dengan bank yang ada.
3. Cek di **Bank Soal** — chip sub-topik & kesulitan harus muncul di tiap soal.
   Jika sebuah sub-topik tampil tak bertaut materi, berarti ada beda 1 karakter →
   perbaiki agar persis sama dengan daftar.
4. Opsional: jalankan validasi cepat sebelum import (lihat di bawah).

## Validasi cepat (opsional, di terminal)
```bash
node -e '
const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
const SUBJ={"Kemampuan Verbal":["Sinonim (Padanan Kata)","Antonim (Lawan Kata)","Analogi (Padanan Hubungan)","Pengelompokan / Pengecualian","Pemahaman Wacana (Reading)"],"Kemampuan Kuantitatif":["Deret Angka & Pola","Pecahan, Persen & Rasio","Rata-rata & Statistik","Aljabar & Soal Cerita","Kecepatan, Jarak, Waktu & Kerja","Peluang & Kombinatorik Dasar","Geometri Dasar"],"Kemampuan Penalaran":["Logika Proposisi (Jika–Maka)","Silogisme Kategoris","Kuantifikasi & Negasinya","Penalaran Analitis (Urutan & Posisi)","Penalaran Himpunan (Diagram Venn)"],"Bahasa Inggris":["Tenses & Verb Forms","Subject-Verb Agreement","Articles & Quantifiers","Prepositions & Collocations","Parallelism & Word Form","Conditionals (Pengandaian)","Reading & Vocabulary in Context"]};
let bad=0;
d.questions.forEach((q,i)=>{
  const e=[];
  if(!SUBJ[q.subject]) e.push("subject tak dikenal");
  else if(!SUBJ[q.subject].includes(q.subtopic)) e.push("subtopic tak cocok: "+JSON.stringify(q.subtopic));
  if(![1,2,3].includes(q.difficulty)) e.push("difficulty bukan 1/2/3");
  if(!Array.isArray(q.options)||q.options.length<2) e.push("options <2");
  if(!/^[A-E]$/.test(String(q.answer))&&!(Number.isInteger(q.answer))) e.push("answer bukan A-E/angka");
  if(q.optExplain&&q.optExplain.length!==q.options.length) e.push("optExplain tak sejajar options");
  if(e.length){bad++;console.log(`Soal ${i+1} (${q.subject}): `+e.join("; "));}
});
console.log(bad?`\n${bad} soal bermasalah`:`\nOK — ${d.questions.length} soal valid`);
' paket.json
```
