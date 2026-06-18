# Tryout SIMAK UI

Website latihan soal ala SIMAK UI Pascasarjana yang berjalan di browser — mode ujian, analitik, latihan adaptif, dengan akun & sinkron antar perangkat.

## Cara pakai
Buka file **`index.html`** dengan klik dua kali (atau klik kanan → Open With → browser seperti Chrome/Safari/Edge).

## Fitur
- **Tampilan modern (baru)** — **mode gelap/terang** (tombol 🌙/☀️ di kanan atas, mengikuti preferensi sistem & tersimpan otomatis), **responsif penuh di HP** (navigasi bisa di-geser, tata letak menyesuaikan layar kecil), serta animasi & efek halus pada kartu/tombol.
- **Beranda** — daftar paket tryout, klik *Mulai Tryout*.
- **Latihan (baru)** — mode latihan **tanpa batas waktu** dengan **umpan balik & pembahasan langsung** tiap soal. Soal dipilih cerdas (spaced repetition): yang sering salah / belum dikuasai didahulukan. Pilihan mode: **Soal yang salah**, **Soal ditandai (bookmark ★)**, **Campur cerdas**, atau **per mata uji**. Bisa bintangi soal sulit (★) untuk dilatih ulang — termasuk dari halaman pembahasan hasil.
- **Rumus matematika & gambar (baru)** — tulis rumus dengan mengapit `$...$` (mis. `$\frac{a}{b}$`, `$x^2$`, `$\sqrt{x}$`, `$\pi$`, `$\leq$`) — langsung tampil rapi di soal, pilihan, & pembahasan, **tanpa internet/instalasi**. Klik gambar soal untuk **memperbesar (zoom)**.
- **Statistik (baru)** — dashboard belajar: **streak hari beruntun**, jumlah tryout, **akurasi keseluruhan**, jumlah soal dikerjakan, **penguasaan per mata uji** (bar akurasi + waktu rata-rata per soal, terlemah di atas dengan tombol *Latih*), dan **tren skor** per paket dalam grafik. Saat ujian, **waktu per soal** ikut terekam dan muncul di rincian hasil.
- **Dua mode waktu (dipilih per paket):**
  - **Per mata uji (sesi terpisah & terkunci)** — tiap mata uji punya waktu sendiri; begitu pindah sesi tidak bisa kembali ke mata uji sebelumnya (seperti CBT SIMAK UI Pascasarjana).
  - **Satu timer global** — semua soal dalam satu waktu total, bebas berpindah antar mata uji.
- **Pengacakan** — acak urutan soal dan acak urutan pilihan jawaban tiap kali tryout diulang (bisa dimatikan per paket).
- **Mode ujian** — timer mundur, navigasi soal, tandai ragu-ragu, auto-submit saat waktu habis / waktu sesi habis.
  - **Pintasan keyboard:** `1`–`5` atau `A`–`E` untuk memilih jawaban, `←`/`→` pindah soal, `F` tandai ragu-ragu.
  - **Tahan reload:** progres tryout otomatis tersimpan, jadi jika halaman ter-refresh / tab tertutup tak sengaja, tryout dilanjutkan dari posisi terakhir (timer tetap berjalan sesuai waktu nyata).
- **Input Soal** — buat paket, atur mode waktu & durasi tiap mata uji, tambah/edit/hapus soal. Soal langsung muncul di tryout.
- **Bank Soal** — lihat semua soal beserta kuncinya.
- **Materi** — bukan sekadar ringkasan, tapi bahan belajar lengkap untuk tiap mata uji, terbagi dua bagian:
  - **Pengetahuan Dasar & Cara Belajar** — skill apa yang diuji, fondasi yang wajib dikuasai (mis. untuk Bahasa Inggris: parts of speech, tenses, agreement, articles, prepositions, clauses, conditionals; serta fondasi kosakata: akar kata, prefiks/sufiks, word family, Academic Word List), cara meningkatkan vocabulary/grammar, dan contoh rencana belajar.
  - **Topik Soal & Strategi** — tiap topik dilengkapi konsep, rumus, jebakan umum, dan **contoh soal yang dikerjakan sampai tuntas**.
  - Materi otomatis menyesuaikan jenis soal yang tersedia; tersedia materi bawaan untuk Kemampuan Verbal, Kuantitatif, Penalaran, dan Bahasa Inggris.
- **Hasil & Pembahasan** — skor total, rincian per mata uji, dan review tiap soal.
- **Rekor & Pencapaian** — setiap tryout dicatat: skor tertinggi (record high) per paket muncul di kartu Beranda dan di menu **Pencapaian**, lengkap dengan notifikasi *Rekor Baru!* saat skor terlampaui. Kumpulkan juga **badge achievement** (mis. *Langkah Pertama*, *Tanpa Cela*, *Juara ≥80%*, *Maraton 10 tryout*) yang terbuka otomatis sesuai capaianmu. Rekor bisa dihapus per paket, atau direset seluruhnya, di menu Pencapaian.
- **Export / Import** — backup atau pindahkan data lewat file JSON (di menu Input Soal). Rekor & pencapaian ikut tersimpan dalam file export.

## Mata uji standar SIMAK UI Pascasarjana
Form input menyarankan tiga mata uji: **Kemampuan Verbal**, **Kemampuan Kuantitatif**, dan **Bahasa Inggris** (bisa ditambah/diganti sesuai kebutuhan).

## Format file import soal (JSON)
File import berupa **JSON** berisi satu objek dengan dua array: `packages` dan `questions`. Lihat **`contoh-import-soal.json`** sebagai template siap pakai.

> Import akan **mengganti seluruh** data yang ada saat ini (selalu Export dulu untuk backup). Setelah parsing, aplikasi otomatis mengisi `id` yang kosong dan menautkan soal ke paket pertama bila `packageId` tidak diisi.

### Struktur paket (`packages`)
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id` | tidak | Pengenal paket. Boleh dikosongkan (dibuat otomatis), tapi jika ingin menautkan soal secara manual, isi dan samakan dengan `packageId` soal. |
| `name` | ya | Nama paket. |
| `mode` | tidak | `"sections"` (timer per mata uji, terkunci) atau `"global"` (satu timer). Default `"sections"`. |
| `durationMin` | tidak | Durasi total (menit) — dipakai saat `mode` = `"global"`. Default 90. |
| `sectionMinutes` | tidak | Objek durasi tiap mata uji, mis. `{"Kemampuan Verbal": 25}` — dipakai saat `mode` = `"sections"`. Mata uji tanpa entri = 30 menit. |
| `shuffleQuestions` | tidak | `true`/`false`, acak urutan soal. Default `true`. |
| `shuffleOptions` | tidak | `true`/`false`, acak urutan pilihan. Default `true`. |

### Struktur soal (`questions`)
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `packageId` | tidak | Harus sama dengan `id` paket pemiliknya. Jika kosong/tak cocok, soal masuk ke paket pertama. |
| `subject` | disarankan | Nama mata uji (mis. `"Kemampuan Verbal"`). Menentukan pengelompokan sesi & rincian skor. |
| `text` | ya | Teks pertanyaan. Gunakan `\n` untuk baris baru. |
| `options` | ya | Array 2–5 pilihan, urutan = A, B, C, D, E. |
| `answer` | ya | Kunci jawaban. Boleh huruf `"A"`–`"E"` **atau** angka indeks `0`–`4` (0 = A). |
| `image` | tidak | URL gambar soal (opsional). |
| `pembahasan` | tidak | Penjelasan jawaban (opsional). |

### Contoh minimal
```json
{
  "packages": [{ "name": "Paket PPDS", "mode": "sections" }],
  "questions": [
    {
      "subject": "Kemampuan Verbal",
      "text": "Sinonim RELEVAN adalah ...",
      "options": ["Bertautan", "Acuh", "Ragu", "Sepadan", "Berbeda"],
      "answer": "A",
      "pembahasan": "Relevan = berkaitan/bertautan."
    }
  ]
}
```

## Menulis rumus matematika
Apit rumus dengan tanda `$...$` di field **text**, **options**, atau **pembahasan**. Didukung tanpa internet:
- Pecahan `\frac{a}{b}`, akar `\sqrt{x}` & `\sqrt[n]{x}`
- Pangkat `x^2` / `x^{n+1}`, indeks `a_1` / `a_{ij}`
- Simbol umum: `\times \div \cdot \pm \leq \geq \neq \approx \pi \theta \alpha \infty \sum \rightarrow \in \cup \cap \deg` dll.

Contoh: `Hasil $\frac{3}{4} + \frac{1}{6}$ adalah ...` dengan pilihan `"$\frac{11}{12}$"`. Di file JSON, ingat tulis backslash ganda (`\\frac`).

## Penilaian (mengikuti pola SIMAK UI)
- Benar: **+4**
- Salah: **−1**
- Kosong: **0**

## Penyimpanan data
Semua paket & soal disimpan di **localStorage** browser, jadi tetap ada saat dibuka lagi dan tryout bisa diulang berkali-kali.

> Catatan: localStorage terikat pada browser & profil di komputer ini. Untuk pindah perangkat, gunakan tombol **Export** lalu **Import** di komputer tujuan.
