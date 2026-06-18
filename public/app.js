/* =========================================================================
   Tryout SIMAK UI Pascasarjana — aplikasi offline (vanilla JS + localStorage)
   Mendukung: mode waktu global / per mata uji (sesi terkunci),
              acak urutan soal & acak pilihan jawaban.
   ========================================================================= */

const STORAGE_KEY = "tryout_simak_ui_ppds_2026_v1";
const EXAM_KEY = "tryout_simak_ui_ppds_2026_exam_v1"; // progress tryout berjalan (agar tahan reload)
const OPT_KEYS = ["A", "B", "C", "D", "E"];
const SCORE = { correct: 4, wrong: -1, empty: 0 };
const PRESET_SUBJECTS = ["Kemampuan Verbal", "Kemampuan Kuantitatif", "Kemampuan Penalaran", "Bahasa Inggris"];
const DEFAULT_SECTION_MIN = 30;

/* Materi pembelajaran per jenis soal (mata uji). Ditautkan ke nama subject. */
const MATERI = {
  "Kemampuan Verbal": {
    icon: "🔤",
    intro: "Menguji penguasaan bahasa Indonesia: ketepatan makna kata, hubungan antar-kata, dan pemahaman bacaan. Skor verbal naik dari dua hal — kosakata yang luas dan kemampuan mengenali POLA HUBUNGAN, bukan menghafal jawaban. Pada SIMAK UI, kata yang diuji cenderung kata serapan dan istilah ilmiah/akademik, jadi biasakan membaca artikel ilmiah populer.",
    guide: [
      { h: "Skill apa yang diuji?",
        body: "Tes verbal mengukur seberapa kaya dan presisi penguasaan bahasamu. Empat kemampuan inti:",
        points: [
          "Kekayaan kosakata — tahu arti banyak kata, terutama kata serapan & istilah akademik.",
          "Pemahaman relasi makna — sinonim, antonim, dan hubungan logis antar-kata (analogi).",
          "Pemahaman bacaan — menangkap ide pokok, detail, dan simpulan dari teks.",
          "Ketelitian membaca perintah — banyak salah bukan karena tak tahu, tapi keliru baca (diminta antonim, dijawab sinonim)." ] },
      { h: "Fondasi 1 — Makna kata & relasinya",
        body: "Memahami bagaimana kata bermakna dan saling berhubungan adalah dasar semua soal sinonim, antonim, dan analogi.",
        points: [
          "Denotasi = makna lugas/kamus; konotasi = makna tambahan (positif/negatif). Contoh: 'kurus' (netral), 'ramping' (positif), 'ceking' (negatif).",
          "Sinonim jarang 100% sama — perhatikan nuansa & tingkat formalitas (mis. 'mati' vs 'wafat' vs 'tewas').",
          "Antonim ada tiga jenis: mutlak (hidup × mati), berderajat (panas × dingin), relasional (guru × murid).",
          "Hiponim–hipernim: hubungan kelas (mawar = hiponim; bunga = hipernim/kelas yang lebih luas).",
          "Polisemi = satu kata banyak makna berkaitan ('kepala' = anggota tubuh / pemimpin); homonim = sama bunyi beda makna ('bisa' = racun / dapat)." ] },
      { h: "Fondasi 2 — Pembentukan kata & ejaan baku",
        points: [
          "Morfologi: imbuhan (awalan me-, ber-, pe-, ter-; akhiran -kan, -i, -an; sisipan) mengubah makna & jenis kata — 'ajar' → pengajar, pelajaran, mengajari.",
          "Kata serapan: kenali pola asalnya (structure → struktur) dan akar Latin/Yunani agar mudah menebak makna.",
          "Bentuk baku KBBI sering jadi pengecoh — yang BENAR: apotek, atlet, izin, risiko, jadwal, sistem, kualitas, analisis (bukan apotik, atlit, ijin, resiko, jadual, sistim, kwalitas, analisa).",
          "Idiom & ungkapan: makna kelompok kata bukan makna harfiah ('kambing hitam' = pihak yang dipersalahkan, 'meja hijau' = pengadilan)." ] },
      { h: "Fondasi 3 — Membaca & wacana",
        points: [
          "Struktur paragraf: ada satu kalimat utama (gagasan pokok) yang dijelaskan kalimat-kalimat penjelas.",
          "Jenis paragraf: deduktif (pokok di awal), induktif (pokok di akhir), campuran.",
          "Bedakan fakta (dapat dibuktikan/diukur) dari opini (pendapat, mengandung kata 'sebaiknya', 'mungkin', 'terbaik').",
          "Ide pokok ≠ judul ≠ selalu kalimat pertama — cari gagasan yang dibahas seluruh kalimat.",
          "Simpulan/inferensi harus berdasar isi teks, bukan pengetahuan dari luar teks." ] },
      { h: "Cara meningkatkan kosakata",
        points: [
          "Membaca beragam: opini, sains populer, sastra — semakin variatif, semakin banyak kata baru bertemu konteks.",
          "Setiap menemui kata asing, cek KBBI; catat arti + 1 kalimat buatan sendiri.",
          "Pelajari akar & imbuhan kata serapan (mis. 'kon-' = bersama, 'a-/non-' = tidak) untuk menebak kata baru.",
          "Buat kelompok kata: kumpulkan sinonim & antonim dalam satu tema agar saling menguatkan.",
          "Spaced repetition: ulang daftar kata pada interval bertambah; gunakan kata baru saat menulis/berbicara.",
          "Target terukur: 10 kata baru/hari = ~300/bulan. Konsisten mengalahkan belajar musiman." ],
        example: "Dari satu akar 'graf/graph' (menulis/menggambar): bioGRAFI, GEOGRAFI, GRAFIK, paraGRAF, fotoGRAFI. Mengenali akar = paham puluhan kata sekaligus." },
      { h: "Cara meningkatkan pemahaman bacaan",
        points: [
          "Active reading: tiap selesai satu paragraf, rumuskan ide pokoknya dengan kata sendiri sebelum lanjut.",
          "Latih dua teknik: skimming (membaca cepat menangkap inti) dan scanning (mencari detail/kata kunci).",
          "Kenali jenis pertanyaan dulu (ide pokok / detail / simpulan / makna kata) agar strategi membaca tepat.",
          "Biasakan teks padat berargumen (editorial, artikel jurnal populer) supaya terlatih mengikuti alur penalaran penulis." ] },
      { h: "Rencana belajar 4 minggu (contoh)",
        points: [
          "Minggu 1 — Makna kata: denotasi/konotasi, sinonim & antonim. Mulai 10 kata baru/hari.",
          "Minggu 2 — Relasi kata & analogi: kuasai tipe-tipe hubungan + latihan analogi.",
          "Minggu 3 — Morfologi, ejaan baku, & pemahaman bacaan (1 teks/hari).",
          "Minggu 4 — Simulasi tryout ber-timer, lalu analisis kesalahan & ulang kata yang masih lemah." ] },
    ],
    topics: [
      { h: "Sinonim (Padanan Kata)", points: [
        "Sinonim = kata bermakna sama/mirip. Soal menuntut padanan yang PALING dekat, bukan sekadar 'agak mirip'.",
        "Strategi akar kata: pecah kata serapan. 'KONVERGEN' (con- = bersama, -verge = mengarah) → mengarah ke satu titik = MEMUSAT.",
        "Strategi konteks: bila ragu, taruh kata target dan tiap opsi dalam satu kalimat; yang tetap masuk akal itu jawabannya.",
        "Strategi eliminasi: buang dulu opsi yang jelas antonim atau tak berhubungan — sisa 2 opsi lebih mudah ditimbang.",
        "Jebakan: opsi yang 'sebunyi' atau seakar tapi beda makna (mis. sanksi vs sangsi)." ],
        example: "Soal: PROTEKSI ≈ ...\nOpsi: a) larangan  b) perlindungan  c) batasan  d) pengawasan  e) ancaman\nAnalisis: akar 'protect' = melindungi. 'Pengawasan' & 'batasan' menggoda tapi bukan inti makna.\nJawaban: b) perlindungan." },
      { h: "Antonim (Lawan Kata)", points: [
        "Antonim = kata berlawanan makna. BACA PERINTAH: soal antonim sering diselipkan di antara soal sinonim untuk menjebak.",
        "Jenis lawan kata: berkebalikan mutlak (hidup × mati), berderajat (panas × dingin), dan relasional (guru × murid).",
        "Teknik: temukan dulu arti kata soal, baru cari kebalikannya — jangan langsung 'merasa' tanpa memastikan arti.",
        "Jebakan: opsi yang merupakan SINONIM dari kata soal (sengaja dipasang agar tertukar)." ],
        example: "Soal: Lawan kata GANJIL adalah ...\nOpsi: a) aneh  b) langka  c) genap  d) ganja  e) tunggal\n'Ganjil' punya dua makna: (1) aneh, (2) bilangan tak habis dibagi 2. Opsi a & b justru SINONIM makna (1) — itu jebakan.\nLawan yang tegas hanya ada untuk makna (2).\nJawaban: c) genap." },
      { h: "Analogi (Padanan Hubungan)", points: [
        "Inti analogi: temukan JENIS HUBUNGAN pada pasangan pertama, lalu cari pasangan kedua dengan hubungan IDENTIK dan ARAH yang sama.",
        "Buat 'kalimat jembatan': mis. DOKTER : STETOSKOP → 'Dokter memakai stetoskop sebagai alat kerja utama.' Uji ke tiap opsi.",
        "Kenali tipe relasi umum: fungsi/alat (PELUKIS:KUAS), bagian–keseluruhan (RODA:MOBIL), sebab–akibat (API:ASAP), urutan/tahap (TELUR:ULAT), profesi–tempat (KOKI:DAPUR), benda–sifat (GULA:MANIS), lawan (TERANG:GELAP).",
        "Perhatikan ARAH: BESAR:KECIL ≠ KECIL:BESAR. Susunan kiri–kanan harus konsisten." ],
        example: "Soal: GURU : MENGAJAR = ... : ...\nJembatan: 'Guru melakukan aktivitas utama mengajar.'\nUji opsi: PETANI : BERTANI ✓  (KORUPTOR : PENJARA ✗ — itu sebab-akibat, bukan profesi-aktivitas)\nJawaban: PETANI : BERTANI." },
      { h: "Pengelompokan / Pengecualian", points: [
        "Soal 'manakah yang tidak sekelompok' menguji klasifikasi: cari kategori yang dimiliki SEMUA opsi kecuali satu.",
        "Coba beberapa dasar pengelompokan (fungsi, asal, sifat fisik) — satu opsi akan gugur di salah satunya.",
        "Hati-hati ada lebih dari satu dasar klasifikasi yang masuk akal; pilih yang membuat HANYA satu opsi berbeda." ],
        example: "Mana yang berbeda? mawar, melati, anggrek, bayam, tulip.\nKategori 'tanaman hias berbunga' dipenuhi semua kecuali BAYAM (sayuran).\nJawaban: bayam." },
      { h: "Pemahaman Wacana (Reading)", points: [
        "Bedakan jenis pertanyaan: ide pokok (global), detail (spesifik), simpulan/inferensi (tersirat), dan makna kata-dalam-konteks.",
        "Untuk ide pokok: baca kalimat pertama & terakhir tiap paragraf — di situ biasanya gagasan utama.",
        "Untuk detail: pakai scanning (cari kata kunci pertanyaan di teks), jangan baca ulang seluruhnya.",
        "Untuk inferensi: kesimpulan harus DIDUKUNG teks; tolak opsi yang 'benar di dunia nyata' tapi tidak disinggung bacaan.",
        "Jebakan klasik: opsi yang terlalu luas/sempit, atau yang memutarbalikkan (over-generalization & opini pribadi)." ],
        example: "Strategi 4 langkah: (1) baca pertanyaan dulu → tahu yang dicari. (2) skim teks untuk struktur. (3) scan kata kunci. (4) cocokkan opsi dengan kalimat sumber — tunjuk barisnya. Bila tak bisa menunjuk barisnya, opsi itu kemungkinan jebakan." },
    ],
  },
  "Kemampuan Kuantitatif": {
    icon: "🔢",
    intro: "Menguji penalaran angka dan kecepatan hitung: deret, aritmetika (pecahan/persen/rasio), aljabar & soal cerita, kecepatan-jarak-waktu, peluang, dan geometri dasar. Kuncinya bukan rumus sebanyak-banyaknya, tetapi MEMAHAMI konsep agar bisa memilih jalan tercepat — sering kali mencoba opsi jawaban (substitusi) lebih cepat daripada menyusun persamaan penuh.",
    guide: [
      { h: "Skill apa yang diuji?",
        body: "Tes kuantitatif menilai logika angka dan kecepatan, bukan matematika tingkat tinggi. Empat kemampuan inti:",
        points: [
          "Berhitung cepat & akurat — operasi dasar tanpa kalkulator, termasuk pecahan & persen.",
          "Pemahaman konsep — tahu KAPAN memakai rumus, bukan sekadar menghafalnya.",
          "Menerjemahkan soal cerita — mengubah kalimat menjadi persamaan/model.",
          "Manajemen waktu — memilih cara tercepat (sering: cek opsi/substitusi) dan tahu kapan melewati soal." ] },
      { h: "Fondasi 1 — Aritmetika",
        body: "Tanpa aritmetika yang lancar, semua tipe soal jadi lambat. Ini dasar paling sering dipakai.",
        points: [
          "Urutan operasi: kurung → pangkat/akar → kali/bagi → tambah/kurang.",
          "Pecahan: samakan penyebut untuk +/−; perkalian = pembilang×pembilang per penyebut×penyebut; pembagian = kali kebalikannya.",
          "Konversi pecahan ↔ desimal ↔ persen: 1/2 = 0,5 = 50%; 1/4 = 25%; 1/5 = 20%; 3/4 = 75%; 1/8 = 12,5%.",
          "KPK (kelipatan persekutuan terkecil) & FPB (faktor persekutuan terbesar) untuk soal 'bersamaan' atau pembagian.",
          "Sifat bilangan: ganjil/genap, prima, serta aturan tanda (negatif × negatif = positif)." ] },
      { h: "Fondasi 2 — Aljabar",
        points: [
          "Variabel & persamaan linear: 'pindah ruas, ganti tanda' (tambah ↔ kurang, kali ↔ bagi).",
          "Dua persamaan dua variabel: selesaikan dengan substitusi atau eliminasi.",
          "Perbandingan senilai (makin banyak ↔ makin banyak) vs berbalik nilai (makin banyak ↔ makin sedikit, mis. pekerja vs waktu).",
          "Pertidaksamaan: balik arah tanda saat mengali/membagi dengan bilangan NEGATIF." ] },
      { h: "Fondasi 3 — Geometri & pengukuran",
        points: [
          "Luas & keliling: persegi, persegi panjang, segitiga (½·a·t), lingkaran (π·r²), trapesium.",
          "Teorema Pythagoras + triple yang sering muncul: 3-4-5, 5-12-13, 8-15-17.",
          "Sudut: jumlah sudut segitiga 180°, segi empat 360°; berpenyiku = 90°, berpelurus = 180°.",
          "Konversi satuan: panjang (km–m–cm), luas, waktu (jam–menit–detik), kecepatan (km/jam ↔ m/detik)." ] },
      { h: "Fondasi 4 — Hafalan yang mempercepat",
        body: "Beberapa hal sebaiknya otomatis di kepala agar waktu habis untuk berpikir, bukan menghitung dasar.",
        points: [
          "Perkalian 1–12 dan kuadrat 1–20 (hingga 20² = 400).",
          "Akar kuadrat sempurna: √144 = 12, √169 = 13, √196 = 14, √225 = 15.",
          "Konversi pecahan-persen umum: 1/3 ≈ 33,3%, 2/3 ≈ 66,7%, 1/6 ≈ 16,7%.",
          "Ciri habis dibagi: 3 (jumlah digit ÷ 3), 4 (dua digit akhir ÷ 4), 9 (jumlah digit ÷ 9)." ] },
      { h: "Cara meningkatkan kecepatan & akurasi",
        points: [
          "Latih mental math harian; pakai pembulatan/estimasi untuk menyaring opsi yang mustahil.",
          "Latihan PER TIPE (15–20 soal sejenis), lalu campur (mixed) menjelang ujian agar terbiasa berpindah pola.",
          "Analisis kesalahan: tandai tiap salah sebagai salah konsep / salah hitung / salah baca — perbaiki sumbernya.",
          "Kuasai dua jalan pintas: 'cek opsi' (substitusi jawaban ke soal) dan 'eliminasi' bila buntu.",
          "Manajemen waktu: lewati soal yang macet, tandai, dan kembali di akhir — jangan terjebak satu soal." ],
        example: "Trik persen: 15% dari 240 = (10% = 24) + (5% = 12) = 36. Memecah persen jadi 10% + 5% jauh lebih cepat daripada 0,15 × 240." },
      { h: "Rencana belajar 4 minggu (contoh)",
        points: [
          "Minggu 1 — Aritmetika, pecahan & persen + hafalan dasar (perkalian, kuadrat).",
          "Minggu 2 — Aljabar, perbandingan, dan soal cerita.",
          "Minggu 3 — Geometri, peluang, kecepatan-jarak-waktu, dan deret.",
          "Minggu 4 — Simulasi tryout ber-timer, lalu analisis kesalahan & ulang tipe yang lemah." ] },
    ],
    topics: [
      { h: "Deret Angka & Pola", points: [
        "Langkah 1: hitung selisih antar suku. Selisih tetap → deret aritmetika (Un = a + (n−1)b).",
        "Langkah 2: bila selisih tak tetap, cek rasio (bagi suku). Rasio tetap → deret geometri (Un = a·r^(n−1)).",
        "Pola lain yang sering keluar: kuadrat/pangkat (1,4,9,16…), Fibonacci (suku = jumlah dua sebelumnya), dan selisih-bertingkat (selisihnya sendiri membentuk deret).",
        "Deret berselang (zig-zag): suku ganjil satu pola, suku genap pola lain — pisahkan dulu.",
        "Jangan terpaku satu hipotesis; uji pola pada SEMUA suku yang diketahui sebelum memilih." ],
        example: "Lengkapi: 2, 6, 12, 20, 30, ...\nSelisih: 4, 6, 8, 10 → selisih naik tetap +2 (selisih bertingkat).\nSelisih berikutnya = 12 → 30 + 12 = 42.\nJawaban: 42. (Pola lain: Un = n² + n.)" },
      { h: "Pecahan, Persen & Rasio", points: [
        "Persen = (bagian / total) × 100%. 'a% dari b' = a/100 × b.",
        "Diskon/kenaikan bertingkat dihitung BERTAHAP (dikalikan), tidak dijumlahkan. Naik 10% lalu turun 10% TIDAK kembali ke awal.",
        "Rasio: ubah ke 'bagian'. Jika A:B = 3:5 dan selisihnya diketahui, 1 bagian = selisih / (5−3).",
        "Trik persen cepat: 1% dari sebuah nilai = nilai ÷ 100; kalikan untuk persen lain (15% = 10% + 5%)." ],
        example: "Harga Rp200.000 naik 10%, lalu didiskon 10%. Harga akhir?\nNaik: 200.000 × 1,10 = 220.000.\nDiskon: 220.000 × 0,90 = 198.000.\nHasil Rp198.000 (< awal) — bukti naik-lalu-turun persen sama tidak balik ke semula." },
      { h: "Rata-rata & Statistik", points: [
        "Jumlah data = rata-rata × banyak data. Ini kunci membongkar hampir semua soal rata-rata.",
        "Rata-rata gabungan = (total semua nilai) ÷ (total semua data) — BUKAN rata-rata dari rata-rata bila jumlah datanya beda.",
        "Bila satu data ditamb/dihapus, bandingkan total sebelum dan sesudah.",
        "Median = nilai tengah data terurut; modus = paling sering. Bedakan dari mean saat soal menyebut 'nilai tengah'." ],
        example: "20 siswa rata-rata 70; 30 siswa rata-rata 80. Rata-rata gabungan?\nTotal = 20×70 + 30×80 = 1.400 + 2.400 = 3.800.\nGabungan = 3.800 ÷ 50 = 76 (bukan 75, karena kelompok 80 lebih banyak)." },
      { h: "Aljabar & Soal Cerita", points: [
        "Terjemahkan kalimat ke persamaan: tetapkan variabel untuk yang DITANYA (atau yang paling kecil agar bilangan rapi).",
        "'lebih tua/banyak dari' → tambah; 'kali' → kali; '… tahun lagi/lalu' → tambah/kurangi pada KEDUA pihak.",
        "Selalu cek ulang jawaban ke kalimat soal — banyak yang benar menghitung tapi salah menjawab yang ditanya.",
        "Jalan pintas: substitusi opsi ke soal; bila satu opsi memenuhi semua syarat, itu jawabannya (hemat waktu)." ],
        example: "Umur ayah 3× umur anak. 10 tahun lagi menjadi 2×. Umur ayah sekarang?\nMisal anak = a, ayah = 3a.\n3a + 10 = 2(a + 10) → 3a + 10 = 2a + 20 → a = 10.\nAyah = 3 × 10 = 30 tahun. (Cek: 10 thn lagi → 40 = 2×20 ✓)" },
      { h: "Kecepatan, Jarak, Waktu & Kerja", points: [
        "Jarak = kecepatan × waktu. Samakan satuan dulu (km/jam vs m/detik).",
        "Soal 'kerja bersama': laju = 1 ÷ waktu sendiri; jumlahkan laju, lalu waktu bersama = 1 ÷ (jumlah laju).",
        "Dua objek berlawanan arah → kecepatan dijumlah; searah → dikurangi (kecepatan relatif).",
        "Kecepatan rata-rata = total jarak ÷ total waktu, BUKAN rata-rata dua kecepatan." ],
        example: "A menyelesaikan tugas 4 jam, B 6 jam. Bila bekerja bersama?\nLaju A = 1/4, B = 1/6 per jam.\nTotal laju = 1/4 + 1/6 = 3/12 + 2/12 = 5/12 tugas/jam.\nWaktu = 1 ÷ 5/12 = 12/5 = 2,4 jam = 2 jam 24 menit." },
      { h: "Peluang & Kombinatorik Dasar", points: [
        "Peluang = (kejadian yang diharapkan) ÷ (semua kemungkinan), nilainya 0–1.",
        "Dua dadu → 36 kemungkinan; satu dadu → 6; satu koin → 2.",
        "'DAN' (kejadian berturut bebas) → kalikan peluang; 'ATAU' (saling lepas) → jumlahkan.",
        "Peluang TIDAK terjadi = 1 − peluang terjadi (sering lebih cepat dihitung lewat komplemen)." ],
        example: "Dua dadu dilempar. Peluang jumlah mata = 7?\nPasangan: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6 cara.\nPeluang = 6/36 = 1/6." },
      { h: "Geometri Dasar", points: [
        "Hafal: luas persegi panjang p×l, segitiga ½·a·t, lingkaran π·r², keliling lingkaran 2π·r.",
        "Teorema Pythagoras (segitiga siku-siku): sisi miring² = sisi₁² + sisi₂². Kenali triple: 3-4-5, 5-12-13, 8-15-17.",
        "Sudut dalam segitiga = 180°, segi empat = 360°.",
        "Untuk bangun gabungan: pecah jadi bangun-bangun sederhana, hitung terpisah, lalu jumlah/kurangi." ],
        example: "Persegi panjang p = 12, l = 5. Panjang diagonalnya?\nDiagonal = √(12² + 5²) = √(144 + 25) = √169 = 13 (triple 5-12-13)." },
    ],
  },
  "Kemampuan Penalaran": {
    icon: "🧩",
    intro: "Menguji ketajaman logika: logika proposisi (jika–maka), silogisme kategoris, kuantifikasi (semua/sebagian) beserta negasinya, serta penalaran analitis (urutan, posisi, penjadwalan). Prinsip emas: kesimpulan yang benar adalah yang PASTI mengikuti premis — jangan menambah asumsi dari pengetahuan umum, dan waspadai over-generalisasi.",
    guide: [
      { h: "Skill apa yang diuji?",
        body: "Penalaran menguji cara berpikir, bukan pengetahuan. Yang dinilai:",
        points: [
          "Berpikir logis — menarik kesimpulan yang SAH (pasti benar) dari informasi yang diberikan.",
          "Memisahkan premis dari kesimpulan, dan membedakan 'sah' (logis) dari 'benar di dunia nyata'.",
          "Abstraksi — mengubah pernyataan menjadi simbol/diagram agar mudah diolah.",
          "Ketelitian terhadap kata kunci: 'semua/sebagian', 'jika/maka', 'tidak', 'kecuali'." ] },
      { h: "Fondasi 1 — Logika proposisi",
        body: "Proposisi adalah pernyataan yang bernilai benar/salah. Memahami operatornya kunci semua soal 'jika–maka'.",
        points: [
          "Konjungsi 'DAN' (P ∧ Q): benar HANYA jika keduanya benar.",
          "Disjungsi 'ATAU' (P ∨ Q): benar jika minimal satu benar.",
          "Implikasi 'jika P maka Q' (P → Q): setara dengan kontraposisinya 'jika bukan Q maka bukan P'.",
          "Penarikan SAH: Modus Ponens (P benar → Q benar) & Modus Tollens (Q salah → P salah).",
          "Penarikan TIDAK sah: konvers (Q → P) dan invers (¬P → ¬Q) — kekeliruan paling sering dalam soal." ] },
      { h: "Fondasi 2 — Kuantifikasi & negasi",
        points: [
          "Universal ('semua/setiap') vs eksistensial ('ada/sebagian/beberapa').",
          "'Semua A adalah B' tidak boleh dibalik menjadi 'semua B adalah A'.",
          "Negasi 'semua A adalah B' = 'ADA A yang bukan B' (cukup satu pengecualian).",
          "Negasi 'sebagian A adalah B' = 'tidak ada A yang B' (semua A bukan B).",
          "Negasi 'jika P maka Q' = 'P DAN tidak Q'." ] },
      { h: "Fondasi 3 — Validitas & sesat pikir (fallacy)",
        points: [
          "Valid ≠ benar: sebuah argumen bisa VALID (bentuknya logis) meski premisnya tak nyata. Yang dinilai bentuknya.",
          "'Pasti' vs 'mungkin': jawaban soal 'yang PASTI benar' harus berlaku di SEMUA kemungkinan, bukan sekadar bisa terjadi.",
          "Fallacy umum: afirmasi konsekuen (membalik implikasi), generalisasi terburu-buru, menyamakan korelasi dengan sebab-akibat, false dilemma (seolah hanya ada dua pilihan).",
          "Jangan menambah asumsi dari pengetahuan umum di luar premis — itu sumber kesalahan terbesar." ] },
      { h: "Fondasi 4 — Penalaran analitis (teknik)",
        points: [
          "Buat tabel/diagram; mulai isi dari syarat yang PASTI, baru syarat relatif.",
          "Terjemahkan syarat ke simbol: 'B di sebelah A' → blok [AB]/[BA]; 'C sebelum D' → C…D.",
          "Eliminasi: uji tiap opsi terhadap daftar syarat; buang yang melanggar minimal satu.",
          "Untuk soal himpunan, gunakan diagram Venn — isi bagian irisan lebih dulu." ] },
      { h: "Cara meningkatkan kemampuan",
        points: [
          "Latih menegasikan & mengontraposisikan pernyataan setiap hari sampai otomatis.",
          "Untuk soal premis, tuliskan ulang dalam bentuk simbol (A → B) sebelum menilai opsi.",
          "Selalu uji opsi dengan pertanyaan: 'Apakah ini PASTI dari premis, atau hanya MUNGKIN?'",
          "Untuk soal analitis, biasakan membuat tabel/diagram — jangan mengandalkan ingatan.",
          "Kerjakan teka-teki logika (sudoku, puzzle penjadwalan) untuk melatih penalaran sistematis.",
          "Analisis kesalahan: salah baca kuantor? membalik implikasi? menambah asumsi?" ],
        example: "Negasi cepat: 'Semua mahasiswa rajin' dinegasikan menjadi 'ADA mahasiswa yang TIDAK rajin' (cukup satu pengecualian) — bukan 'semua mahasiswa malas'." },
      { h: "Rencana belajar 4 minggu (contoh)",
        points: [
          "Minggu 1 — Proposisi, konjungsi/disjungsi, implikasi & kontraposisi.",
          "Minggu 2 — Kuantifikasi, negasi, & silogisme kategoris.",
          "Minggu 3 — Sesat pikir (fallacy) & penalaran analitis (tabel/diagram Venn).",
          "Minggu 4 — Simulasi tryout ber-timer, lalu analisis kesalahan & ulang tipe yang lemah." ] },
    ],
    topics: [
      { h: "Logika Proposisi (Jika–Maka)", points: [
        "Implikasi 'Jika P maka Q' (P→Q). Dua penarikan SAH: Modus Ponens (P benar → Q benar) & Modus Tollens (Q salah → P salah).",
        "Kontraposisi SELALU setara: 'Jika P maka Q' ≡ 'Jika bukan Q maka bukan P'.",
        "Dua kekeliruan umum (TIDAK sah): konvers (Q→P) dan invers (¬P→¬Q). Q terjadi tak menjamin P penyebabnya.",
        "Negasi implikasi: ingkaran dari 'Jika P maka Q' adalah 'P DAN tidak Q'." ],
        example: "Premis: 'Jika hujan, maka jalan basah.' Fakta: jalan TIDAK basah.\nModus Tollens → kesimpulan sah: 'maka tidak hujan'.\nJebakan: bila fakta 'jalan basah', TIDAK sah menyimpulkan 'pasti hujan' (bisa karena disiram) — itu konvers." },
      { h: "Silogisme Kategoris", points: [
        "Bentuk klasik: premis mayor + premis minor → kesimpulan yang menautkan keduanya.",
        "'Semua A adalah B' + 'C adalah A' → 'C adalah B' (sah).",
        "Periksa rantai: kesimpulan hanya sah bila ada term penghubung yang konsisten di kedua premis.",
        "Hati-hati premis dengan 'sebagian' — biasanya tidak menghasilkan kesimpulan universal yang pasti." ],
        example: "P1: Semua mamalia bernapas dengan paru-paru.\nP2: Paus adalah mamalia.\nKesimpulan sah: Paus bernapas dengan paru-paru." },
      { h: "Kuantifikasi & Negasinya", points: [
        "'Semua A adalah B' tidak berarti 'Semua B adalah A' (jangan dibalik).",
        "'Sebagian' = minimal satu, mungkin semua — tetapi tidak DIJAMIN semua.",
        "Negasi 'Semua A adalah B' = 'Ada (minimal satu) A yang BUKAN B' — bukan 'Semua A bukan B'.",
        "Negasi 'Sebagian A adalah B' = 'Tidak ada A yang B' (semua A bukan B)." ],
        example: "Pernyataan: 'Semua peserta lulus.'\nNegasi yang benar: 'Ada (paling sedikit satu) peserta yang TIDAK lulus.'\nKeliru: 'Semua peserta tidak lulus' (itu negasi yang berlebihan)." },
      { h: "Penalaran Analitis (Urutan & Posisi)", points: [
        "Buat sketsa/tabel. Tuliskan dulu syarat PASTI (mis. 'A di ujung'), baru syarat relatif.",
        "Terjemahkan syarat ke simbol: 'B di sebelah A' → blok [AB] atau [BA]; 'C sebelum D' → C…D.",
        "Eliminasi: untuk soal pilihan ganda, uji tiap opsi terhadap daftar syarat; buang yang melanggar ≥1 syarat.",
        "Bedakan 'harus' vs 'mungkin': pertanyaan 'pasti benar' menuntut yang berlaku di SEMUA susunan valid." ],
        example: "5 orang (A–E) berderet. Syarat: A di ujung; B bersebelahan A; C tidak bersebelahan B.\nMulai: A di posisi 1 → B di posisi 2 (menempel A). C tak boleh di posisi 3 (sebelah B) → C minimal posisi 4/5.\nUji opsi dengan aturan ini; opsi yang menaruh C di posisi 3 langsung gugur." },
      { h: "Penalaran Himpunan (Diagram Venn)", points: [
        "Gambar lingkaran beririsan untuk 'suka keduanya'. Isi irisan dulu, baru bagian 'hanya satu'.",
        "Hanya A = (total A) − (irisan). Salah satu (A atau B) = hanyaA + hanyaB + irisan.",
        "Yang di luar semua himpunan = total keseluruhan − (yang masuk salah satu himpunan).",
        "Untuk tiga himpunan, gunakan inklusi-eksklusi; kerjakan dari irisan paling dalam ke luar." ],
        example: "100 orang: 60 suka teh, 50 suka kopi, 20 suka keduanya.\nTeh saja = 60 − 20 = 40; kopi saja = 50 − 20 = 30.\nSuka salah satu = 40 + 30 + 20 = 90.\nTidak suka keduanya = 100 − 90 = 10." },
    ],
  },
  "Bahasa Inggris": {
    icon: "🇬🇧",
    intro: "Menguji Structure & Written Expression, Vocabulary, dan Reading Comprehension setara TOEFL. Soal structure menguji 'kerangka' kalimat (tense, agreement, paralelisme, kata depan) — jadi kuasai aturan inti, bukan menghafal kalimat. Untuk reading & vocabulary, perbanyak baca teks akademik agar peka konteks.",
    guide: [
      { h: "Skill apa yang sebenarnya diuji?",
        body: "Soal Bahasa Inggris akademik bertumpu pada empat kemampuan. Ketahui keempatnya agar belajarmu terarah, bukan sekadar mengerjakan banyak soal.",
        points: [
          "Grammar / Structure — mengenali kalimat yang secara tata bahasa benar: tense, subject-verb agreement, paralelisme, kata depan, dan struktur klausa.",
          "Vocabulary — memahami arti kata, sinonim/antonim, dan terutama makna kata SESUAI KONTEKS kalimat.",
          "Reading Comprehension — menangkap ide pokok, detail, dan menyimpulkan informasi tersirat dari teks.",
          "Kecepatan & ketelitian — menyelesaikan banyak soal dalam waktu terbatas tanpa terkecoh opsi pengecoh (distractor)." ] },
      { h: "Fondasi grammar yang WAJIB dikuasai",
        body: "Inilah 'kerangka' bahasa Inggris. Pelajari satu per satu sampai paham polanya — hampir semua soal structure berputar di sini.",
        points: [
          "Parts of speech (jenis kata): noun (kata benda), verb (kerja), adjective (sifat), adverb (keterangan), pronoun, preposition, conjunction, article. Tahu fungsi tiap jenis = bisa memilih 'word form' yang tepat.",
          "16 tenses inti — minimal kuasai: Simple Present/Past/Future, Present/Past Continuous, dan Present/Past Perfect. Kenali penanda waktunya (yesterday, since, by next year, already).",
          "Subject-Verb Agreement: kata kerja menyesuaikan subjek inti (is/are, was/were, has/have, V1/Vs).",
          "Articles (a/an/the) & quantifiers (much/many, little/few, some/any).",
          "Prepositions & kolokasi tetap (consistent with, depend on, capable of).",
          "Clauses & connectors: relative clause (who/which/that), conjunction (although, because, however), dan paralelisme.",
          "Conditionals (type 0–3), passive voice (be + V3), comparison (-er/more, the -est/most), serta gerund vs infinitive (enjoy + V-ing, want + to V)." ] },
      { h: "Fondasi vocabulary: cara kerja kata",
        body: "Menghafal daftar kata itu lambat. Lebih efektif memahami 'mesin' pembentuk kata sehingga kamu bisa MENEBAK ribuan kata baru.",
        points: [
          "Akar kata (root) Latin/Yunani: spect = melihat (inspect, spectator), port = membawa (export, portable), dict = berkata (predict, dictionary).",
          "Prefiks (awalan) mengubah makna: un-/in-/im- (tidak), re- (kembali), pre- (sebelum), mis- (salah), over- (berlebih).",
          "Sufiks (akhiran) menentukan jenis kata: -tion/-ment/-ness (noun), -ous/-ful/-al (adjective), -ly (adverb), -ize/-ate (verb).",
          "Word family: satu kata dalam berbagai bentuk — analyze (v), analysis (n), analytical (adj), analytically (adv).",
          "Academic Word List (AWL): prioritaskan kata akademik yang sering muncul — analyze, significant, consist, derive, approach, evident, concept, factor, method, occur." ],
        example: "Tahu root 'spect' (melihat) + prefiks → inSPECT (memeriksa), reSPECT (kembali melihat = menghargai), proSPECT (melihat ke depan = prospek), SPECTator (penonton). Satu akar membuka banyak kata." },
      { h: "Cara meningkatkan vocabulary (langkah nyata)",
        body: "Vocabulary tumbuh dari paparan berulang + pengolahan aktif, bukan dihafal sekali duduk.",
        points: [
          "Extensive reading: baca artikel berbahasa Inggris tiap hari (berita, sains populer, abstrak jurnal). Konteks membuat kata melekat.",
          "Catat kata baru dalam KALIMAT, bukan kata tunggal — tulis arti + 1 contoh pemakaian sendiri.",
          "Spaced repetition: ulang kata pada interval makin panjang (1 hari, 3 hari, 1 minggu). Kartu Anki/flashcard sangat membantu.",
          "Belajar per word family & per akar kata, bukan kata acak — sekali belajar dapat banyak.",
          "Pakai kata baru secara aktif: tulis kalimat, ucapkan, atau gunakan saat menjawab latihan.",
          "Target terukur: 10 kata akademik/hari = ~300/bulan. Konsisten lebih penting daripada banyak sekaligus." ] },
      { h: "Cara meningkatkan grammar & reading",
        points: [
          "Pelajari SATU topik grammar/hari (mis. hari ini 'present perfect'), lalu kerjakan 10–20 soal khusus topik itu.",
          "Bedah kalimat: tandai subjek, kata kerja, dan klausa — latih sampai otomatis melihat strukturnya.",
          "Active reading: tiap paragraf, rumuskan ide pokoknya dengan kata sendiri sebelum lanjut.",
          "Latihan dengan timer (timed practice) agar terbiasa kecepatan ujian; setelahnya ANALISIS kesalahan — di situ belajar sesungguhnya.",
          "Bangun 'telinga' bahasa: tonton film/video berbahasa Inggris dengan subtitle Inggris untuk memperkuat pola alami." ] },
      { h: "Rencana belajar 4 minggu (contoh)",
        points: [
          "Minggu 1 — Fondasi: parts of speech + tenses dasar. Mulai 10 kata AWL/hari.",
          "Minggu 2 — Structure: agreement, articles, prepositions, paralelisme + latihan per topik.",
          "Minggu 3 — Lanjutan: clauses, conditionals, passive, comparison + reading 1 teks/hari.",
          "Minggu 4 — Simulasi: kerjakan tryout penuh ber-timer, analisis kesalahan, ulang kata yang masih lemah." ] },
    ],
    topics: [
      { h: "Tenses & Verb Forms", points: [
        "Cocokkan kata kerja dengan PENANDA WAKTU: 'yesterday/ago' → past; 'since/for + now' → present perfect; 'by + waktu depan' → future perfect.",
        "Present perfect (have/has + V3) = aksi lampau yang relevan/berlanjut ke kini. Past simple = selesai dan terikat waktu lampau.",
        "Setelah modal (will, can, must) selalu pakai V1; setelah 'to' umumnya V1 (infinitive).",
        "Perhatikan kalimat pasif: be + V3 ('the report was written'), bukan V2." ],
        example: "Pilih bentuk: 'By next June, she ___ here for ten years.'\nPenanda 'by + waktu depan' + durasi → Future Perfect.\nJawaban: 'will have worked'." },
      { h: "Subject-Verb Agreement", points: [
        "Verb mengikuti SUBJEK inti, bukan kata yang menempel di belakangnya: 'The box of tools IS heavy.'",
        "Frasa penyela (of…, with…, as well as…) tidak mengubah jumlah subjek.",
        "'The number of …' = tunggal (is); 'A number of …' = jamak (are).",
        "Subjek dengan 'each/every/either/neither' → tunggal; 'both/several/many' → jamak." ],
        example: "Pilih: 'The number of applicants ___ rising each year.'\n'The number of' = tunggal → 'is'.\nBandingkan: 'A number of applicants ARE waiting' (jamak)." },
      { h: "Articles & Quantifiers", points: [
        "Countable jamak → few/fewer/many; uncountable → little/less/much.",
        "'little/few' (tanpa a) = nyaris tidak ada (nada NEGATIF); 'a little/a few' = ada sedikit (nada POSITIF).",
        "'a' sebelum bunyi konsonan, 'an' sebelum bunyi vokal (an hour — bunyi vokal; a university — bunyi 'yu').",
        "'the' untuk benda spesifik/sudah disebut; tanpa artikel untuk makna umum jamak/uncountable." ],
        example: "'The committee may take ___ more time to decide.'\n'Time' uncountable & bernada positif (masih ada sedikit waktu) → 'a little'." },
      { h: "Prepositions & Collocations", points: [
        "Banyak jawaban ditentukan pasangan tetap. Hafalkan: consistent WITH, depend ON, result IN, capable OF, interested IN, responsible FOR, similar TO, different FROM.",
        "Kata kerja + preposisi mengubah makna (look up/after/into) — kenali sebagai satu unit.",
        "Waktu: at (jam), on (hari/tanggal), in (bulan/tahun); tempat: at (titik), on (permukaan), in (ruang)." ],
        example: "'The results were not ___ with the hypothesis.'\nKolokasi tetap 'consistent with' (butuh adjektiva).\nJawaban: 'consistent' (bukan consist/consistence)." },
      { h: "Parallelism & Word Form", points: [
        "Unsur dalam satu daftar/perbandingan harus SEJAJAR bentuknya (semua -ing, atau semua infinitive, atau semua kata benda).",
        "Pilih bentuk kata (word form) sesuai fungsinya: subjek/objek → noun; menerangkan noun → adjective; menerangkan verb → adverb.",
        "Setelah preposisi, kata kerja jadi gerund (-ing): 'good at solving', 'before leaving'." ],
        example: "Salah: 'He is responsible for hiring, training, and to evaluate staff.'\nUnsur tak sejajar (to evaluate). Benar: '...hiring, training, and evaluating staff.'" },
      { h: "Conditionals (Pengandaian)", points: [
        "Type 1 (nyata/mungkin): If + present, … will + V1. ('If it rains, we will stay.')",
        "Type 2 (tidak nyata, kini): If + past, … would + V1. Gunakan 'were' untuk semua subjek ('If I WERE you…').",
        "Type 3 (penyesalan masa lalu): If + past perfect, … would have + V3.",
        "Perhatikan pergeseran: jenis pengandaian menentukan bentuk kata kerja di kedua klausa." ],
        example: "Type 3: 'If I ___ harder, I would have passed.'\nPola: If + had + V3.\nJawaban: 'had studied'." },
      { h: "Reading & Vocabulary in Context", points: [
        "Tentukan jenis soal dulu: main idea, detail, inference, reference (kata ganti merujuk apa), atau vocab-in-context.",
        "Vocab-in-context: abaikan arti kamus yang kamu hafal; pilih makna yang COCOK dengan kalimat sekitarnya.",
        "Inference: jawaban harus bisa ditelusuri ke teks; tolak yang sekadar 'terdengar benar'.",
        "Kelola waktu: untuk teks panjang, baca pertanyaan → scan kata kunci → baca kalimat sekitar temuan." ],
        example: "Kalimat: 'The novel was a watershed, changing how critics viewed the genre.'\n'watershed' di sini = titik balik/momen penting (bukan arti harfiah 'batas aliran air'), karena konteks 'changing how…'." },
    ],
  },
};

/* Daftar pencapaian (badge). Tiap badge dicek setelah tryout selesai. */
const ACHIEVEMENTS = [
  { id: "first_try",       icon: "🎯", name: "Langkah Pertama", desc: "Selesaikan tryout pertamamu." },
  { id: "full_house",      icon: "✅", name: "Tuntas",          desc: "Jawab semua soal dalam satu tryout (tidak ada yang kosong)." },
  { id: "flawless",        icon: "✨", name: "Tanpa Cela",      desc: "Selesaikan tryout tanpa satu pun jawaban salah." },
  { id: "perfect_subject", icon: "💯", name: "Spesialis",       desc: "Raih nilai sempurna di salah satu mata uji." },
  { id: "high_scorer",     icon: "🏆", name: "Juara",           desc: "Capai skor ≥ 80% dalam satu tryout." },
  { id: "sharp_shooter",   icon: "🎓", name: "Nyaris Sempurna", desc: "Capai skor ≥ 95% dalam satu tryout." },
  { id: "new_record",      icon: "📈", name: "Rekor Baru",      desc: "Pecahkan rekor skor tertinggimu di sebuah paket." },
  { id: "persistent",      icon: "🔥", name: "Gigih",           desc: "Selesaikan total 5 tryout." },
  { id: "marathon",        icon: "🏃", name: "Maraton",         desc: "Selesaikan total 10 tryout." },
];

/* ---------- Data layer ---------- */
function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeStore(JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return normalizeStore(seedStore());
}
function saveStore() {
  store._updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    schedulePush();   // sinkron ke server jika sedang login
    return true;
  } catch (e) {
    // Umumnya QuotaExceededError — mis. gambar besar / data URI atau soal terlalu banyak.
    toast("⚠️ Penyimpanan penuh — perubahan terbaru mungkin tidak tersimpan. Kurangi gambar besar, atau Export lalu hapus sebagian data.");
    return false;
  }
}

/* ---- Progress tryout berjalan (tahan reload / tab tertutup tak sengaja) ---- */
function persistExam() {
  if (!examState) return;
  try { localStorage.setItem(EXAM_KEY, JSON.stringify(examState)); } catch (e) { /* abaikan */ }
}
function clearExam() {
  try { localStorage.removeItem(EXAM_KEY); } catch (e) { /* abaikan */ }
}
function tryRestoreExam() {
  try {
    const raw = localStorage.getItem(EXAM_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.sections) || saved.sections.length === 0) { clearExam(); return false; }
    saved.sections.forEach(sec => {
      if (!Array.isArray(sec.timeSpent) || sec.timeSpent.length !== sec.questions.length)
        sec.timeSpent = new Array(sec.questions.length).fill(0);
    });
    examState = saved;
    return true;
  } catch (e) { clearExam(); return false; }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function normalizeStore(s) {
  s.packages = s.packages || [];
  s.questions = s.questions || [];
  s.records = s.records || {};       // rekor & riwayat per paket, keyed by pkgId
  s.achievements = s.achievements || {};  // { achievementId: timestamp terbuka }
  s.qstats = s.qstats || {};         // statistik per soal: { seen, correct, wrong, empty, lastResult, lastSeen, timeMs }
  s.bookmarks = s.bookmarks || {};   // soal ditandai: { qId: timestamp }
  s.practiceLog = s.practiceLog || []; // timestamp tiap sesi latihan (untuk streak)
  if (s._updatedAt == null) s._updatedAt = 0; // penanda versi untuk sinkron antar perangkat
  s.packages.forEach(p => {
    if (!p.mode) p.mode = "sections";
    if (p.durationMin == null) p.durationMin = 90;
    if (!p.sectionMinutes) p.sectionMinutes = {};
    if (p.shuffleQuestions == null) p.shuffleQuestions = true;
    if (p.shuffleOptions == null) p.shuffleOptions = true;
  });
  return s;
}

/* Merapikan data hasil import yang ditulis tangan:
   - buat id paket/soal jika kosong
   - tautkan soal ke paket pertama jika packageId kosong/tak cocok
   - pastikan answer berupa angka 0–4 (mendukung "A".."E" juga) */
function prepareImported(data) {
  if (!data || !Array.isArray(data.packages) || !Array.isArray(data.questions))
    throw new Error("format");
  data.packages.forEach(p => { if (!p.id) p.id = uid(); });
  const ids = data.packages.map(p => p.id);
  const fallback = ids[0];
  data.questions.forEach(q => {
    if (!q.id) q.id = uid();
    if (!q.packageId || !ids.includes(q.packageId)) q.packageId = fallback;
    if (typeof q.answer === "string") {
      const k = OPT_KEYS.indexOf(q.answer.trim().toUpperCase());
      q.answer = k >= 0 ? k : parseInt(q.answer);
    }
    if (!Number.isInteger(q.answer)) q.answer = 0;
    if (!Array.isArray(q.options)) q.options = [];
    if (q.image == null) q.image = "";
    if (q.subject == null) q.subject = "";
    if (q.pembahasan == null) q.pembahasan = "";
  });
  return normalizeStore(data);
}

function seedStore() {
  const pkgId = uid();
  return {
    packages: [{
      id: pkgId, name: "Tryout SIMAK UI PPDS 2026 — TPA & Bahasa Inggris",
      mode: "sections", durationMin: 150,
      sectionMinutes: { "Kemampuan Verbal": 30, "Kemampuan Kuantitatif": 30, "Kemampuan Penalaran": 30, "Bahasa Inggris": 60 },
      shuffleQuestions: true, shuffleOptions: true, createdAt: Date.now(),
    }],
    questions: [
      // ----- TPA: Kemampuan Verbal -----
      { id: uid(), packageId: pkgId, subject: "Kemampuan Verbal",
        text: "Sinonim kata KONVERGEN adalah ...", image: "",
        options: ["Memusat", "Menyebar", "Melebar", "Berbeda", "Bercabang"], answer: 0,
        pembahasan: "Konvergen berarti menuju satu titik pertemuan / memusat. Lawan katanya divergen (menyebar). Jawaban: A." },
      { id: uid(), packageId: pkgId, subject: "Kemampuan Verbal",
        text: "DOKTER : STETOSKOP = PELUKIS : ...", image: "",
        options: ["Kanvas", "Warna", "Kuas", "Galeri", "Lukisan"], answer: 2,
        pembahasan: "Stetoskop adalah alat kerja utama dokter; alat kerja utama pelukis adalah kuas. Jawaban: C." },
      // ----- TPA: Kemampuan Kuantitatif -----
      { id: uid(), packageId: pkgId, subject: "Kemampuan Kuantitatif",
        text: "Suku berikutnya dari deret 3, 6, 12, 24, ... adalah ...", image: "",
        options: ["30", "36", "42", "48", "54"], answer: 3,
        pembahasan: "Setiap suku dikali 2: 24 × 2 = 48. Jawaban: D." },
      { id: uid(), packageId: pkgId, subject: "Kemampuan Kuantitatif",
        text: "Jika rata-rata 5 bilangan adalah 14, dan satu bilangan dihapus sehingga rata-ratanya menjadi 12, maka bilangan yang dihapus adalah ...", image: "",
        options: ["18", "20", "22", "24", "26"], answer: 2,
        pembahasan: "Jumlah 5 bilangan $= 5 \\times 14 = 70$. Jumlah 4 bilangan $= 4 \\times 12 = 48$. Bilangan yang dihapus $= 70 - 48 = 22$. Jawaban: C." },
      { id: uid(), packageId: pkgId, subject: "Kemampuan Kuantitatif",
        text: "Hasil dari $\\frac{3}{4} + \\frac{1}{6}$ adalah ...", image: "",
        options: ["$\\frac{11}{12}$", "$\\frac{4}{10}$", "$\\frac{5}{6}$", "$\\frac{7}{12}$", "$1$"], answer: 0,
        pembahasan: "Samakan penyebut ke 12: $\\frac{3}{4} = \\frac{9}{12}$ dan $\\frac{1}{6} = \\frac{2}{12}$. Jumlahnya $\\frac{9}{12} + \\frac{2}{12} = \\frac{11}{12}$. Jawaban: A." },
      { id: uid(), packageId: pkgId, subject: "Kemampuan Kuantitatif",
        text: "Jika $x^2 = 144$ dan $x > 0$, maka nilai $\\sqrt{x} \\times 3$ adalah ...", image: "",
        options: ["$36$", "$\\sqrt{12}$", "$3\\sqrt{12}$", "$12$", "$6\\sqrt{3}$"], answer: 2,
        pembahasan: "Dari $x^2 = 144$ dan $x>0$ diperoleh $x = 12$. Maka $\\sqrt{x} \\times 3 = 3\\sqrt{12}$. Jawaban: C." },
      // ----- TPA: Kemampuan Penalaran -----
      { id: uid(), packageId: pkgId, subject: "Kemampuan Penalaran",
        text: "Semua dokter spesialis pernah menjadi dokter umum. Sebagian dokter umum mengambil PPDS. Kesimpulan yang PASTI benar adalah ...", image: "",
        options: [
          "Semua dokter umum menjadi spesialis",
          "Sebagian dokter umum berpotensi menjadi spesialis",
          "Tidak ada dokter umum yang menjadi spesialis",
          "Semua yang mengambil PPDS adalah spesialis",
          "Dokter spesialis tidak pernah menjadi dokter umum",
        ], answer: 1,
        pembahasan: "Hanya pernyataan B yang konsisten dengan premis; opsi lain overgeneralisasi atau bertentangan dengan premis. Jawaban: B." },
      // ----- Bahasa Inggris -----
      { id: uid(), packageId: pkgId, subject: "Bahasa Inggris",
        text: "The committee has not yet reached a decision, and it may take ___ more time to do so.\n\nChoose the best option to complete the sentence.", image: "",
        options: ["little", "few", "a little", "a few", "fewer"], answer: 2,
        pembahasan: "'Time' adalah kata benda tak terhitung dan kalimatnya bermakna positif, sehingga dipakai 'a little'. Jawaban: C." },
      { id: uid(), packageId: pkgId, subject: "Bahasa Inggris",
        text: "The patient's symptoms were ___ with the initial diagnosis, so no further tests were ordered.\n\nChoose the best word.", image: "",
        options: ["consistent", "consist", "consistence", "consisting", "consisted"], answer: 0,
        pembahasan: "'be consistent with' = sesuai/selaras dengan. Bentuk yang tepat adalah adjektiva 'consistent'. Jawaban: A." },
    ],
  };
}

let store = loadStore();

/* ---------- Helpers ---------- */
function $(sel, root = document) { return root.querySelector(sel); }
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}
function questionsOf(pkgId) { return store.questions.filter(q => q.packageId === pkgId); }
function pkgById(id) { return store.packages.find(p => p.id === id); }
function subjectsOf(pkgId) {
  const order = [];
  questionsOf(pkgId).forEach(q => { const s = q.subject || "Lainnya"; if (!order.includes(s)) order.push(s); });
  return order;
}
function truncate(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n) + "…" : s; }
/* Huruf kunci jawaban seperti yang tampil di ujian: pilihan kosong difilter,
   jadi huruf dihitung dari posisi di antara pilihan yang terisi. */
function answerLetter(q) {
  const nonEmpty = q.options.map((_, i) => i).filter(i => String(q.options[i]).trim() !== "");
  const pos = nonEmpty.indexOf(q.answer);
  return OPT_KEYS[pos >= 0 ? pos : q.answer];
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function fmtTime(ms) {
  const m = Math.floor(ms / 60000), sec = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function fmtDur(ms) {
  ms = Math.max(0, Math.round(ms));
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} dtk`;
  const m = Math.floor(s / 60), r = s % 60;
  return r ? `${m}m ${r}d` : `${m} mnt`;
}

/* ---------- Statistik & latihan: helpers ---------- */
// Catat hasil pengerjaan satu soal (dipakai tryout & latihan).
function recordQStat(qId, outcome, timeMs) {
  if (!qId) return;
  const st = store.qstats[qId] || { seen: 0, correct: 0, wrong: 0, empty: 0, lastResult: null, lastSeen: 0, timeMs: 0 };
  st.seen++;
  st[outcome] = (st[outcome] || 0) + 1;
  st.lastResult = outcome;
  st.lastSeen = Date.now();
  st.timeMs += timeMs || 0;
  store.qstats[qId] = st;
}
function dayKey(ts) { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function activityDays() {
  const days = new Set();
  Object.values(store.records).forEach(r => (r.history || []).forEach(h => days.add(dayKey(h.date))));
  (store.practiceLog || []).forEach(ts => days.add(dayKey(ts)));
  return days;
}
function computeStreak() {
  const days = activityDays();
  if (!days.size) return 0;
  let streak = 0;
  const cur = new Date();
  // mulai dari hari ini; jika hari ini belum ada aktivitas, izinkan mulai dari kemarin
  if (!days.has(dayKey(cur.getTime()))) cur.setDate(cur.getDate() - 1);
  while (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}
// Peta id soal -> subject (untuk agregasi statistik per mata uji).
function qSubjectMap() {
  const m = {};
  store.questions.forEach(q => { m[q.id] = q.subject || "Lainnya"; });
  return m;
}
// Penguasaan per mata uji dari qstats: { subject, attempts, correct, accuracy, avgMs, qCount }
function subjectMastery() {
  const map = qSubjectMap();
  const agg = {};
  const qBySubj = {};
  store.questions.forEach(q => { const s = q.subject || "Lainnya"; qBySubj[s] = (qBySubj[s] || 0) + 1; });
  Object.entries(store.qstats).forEach(([qId, st]) => {
    const s = map[qId]; if (!s) return; // soal sudah dihapus
    const a = agg[s] || (agg[s] = { subject: s, attempts: 0, correct: 0, wrong: 0, empty: 0, timeMs: 0, answered: 0 });
    a.attempts += st.seen; a.correct += st.correct; a.wrong += st.wrong; a.empty += st.empty;
    a.timeMs += st.timeMs; a.answered += st.correct + st.wrong;
  });
  return Object.values(agg).map(a => ({
    ...a,
    qCount: qBySubj[a.subject] || 0,
    accuracy: a.answered > 0 ? Math.round((a.correct / a.answered) * 100) : null,
    avgMs: a.attempts > 0 ? a.timeMs / a.attempts : 0,
  }));
}
// Skor prioritas SRS: makin tinggi = makin perlu dilatih.
function srsPriority(qId) {
  const st = store.qstats[qId];
  if (!st || !st.seen) return 100; // soal baru → prioritas tinggi
  let p = 0;
  if (st.lastResult === "wrong") p += 50;
  else if (st.lastResult === "empty") p += 30;
  p += Math.max(0, st.wrong - st.correct) * 12;
  const days = (Date.now() - st.lastSeen) / 86400000;
  p += Math.min(25, days * 3);
  if (st.correct >= 2 && st.lastResult === "correct" && st.wrong === 0) p -= 30; // sudah dikuasai
  return p;
}
// Soal yang masih sering salah / belum dikuasai.
function weakQuestionIds() {
  return store.questions.filter(q => {
    const st = store.qstats[q.id];
    if (!st || !st.seen) return false;
    return st.lastResult === "wrong" || st.lastResult === "empty" || st.wrong > st.correct;
  }).map(q => q.id);
}
function isBookmarked(qId) { return !!store.bookmarks[qId]; }
function toggleBookmark(qId) {
  if (store.bookmarks[qId]) delete store.bookmarks[qId];
  else store.bookmarks[qId] = Date.now();
  saveStore();
  return isBookmarked(qId);
}

/* ---------- Rumus matematika (ringan, tanpa dependensi) & media ----------
   Pakai $...$ untuk menandai rumus. Dukungan: \frac{a}{b}, \sqrt{x}, \sqrt[n]{x},
   pangkat a^2 / a^{xy}, indeks a_1 / a_{ij}, dan simbol umum (\times, \pi, \leq, ...). */
const MATH_SYM = {
  times: "×", div: "÷", cdot: "·", pm: "±", mp: "∓", ast: "∗", star: "⋆",
  leq: "≤", le: "≤", geq: "≥", ge: "≥", neq: "≠", ne: "≠", approx: "≈", equiv: "≡", sim: "∼", propto: "∝",
  lt: "&lt;", gt: "&gt;", ll: "≪", gg: "≫",
  pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ", Gamma: "Γ", delta: "δ", Delta: "Δ",
  epsilon: "ε", lambda: "λ", Lambda: "Λ", mu: "μ", nu: "ν", rho: "ρ", sigma: "σ", Sigma: "Σ",
  tau: "τ", phi: "φ", Phi: "Φ", omega: "ω", Omega: "Ω", varphi: "φ", varepsilon: "ε",
  infty: "∞", partial: "∂", nabla: "∇", sum: "∑", prod: "∏", int: "∫",
  rightarrow: "→", Rightarrow: "⇒", to: "→", leftarrow: "←", Leftarrow: "⇐", leftrightarrow: "↔", mapsto: "↦",
  in: "∈", notin: "∉", ni: "∋", subset: "⊂", subseteq: "⊆", supset: "⊃", supseteq: "⊇",
  cup: "∪", cap: "∩", emptyset: "∅", varnothing: "∅", forall: "∀", exists: "∃", neg: "¬",
  land: "∧", lor: "∨", angle: "∠", deg: "°", circ: "∘", perp: "⊥", parallel: "∥",
  ldots: "…", cdots: "⋯", dots: "…", quad: "&nbsp;&nbsp;", qquad: "&nbsp;&nbsp;&nbsp;&nbsp;",
};
function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
// Baca grup {...} berimbang mulai dari posisi '{' di i.
function readBraceGroup(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}") { depth--; if (depth === 0) return { content: s.slice(i + 1, j), end: j }; }
  }
  return { content: s.slice(i + 1), end: s.length - 1 };
}
function mathToHtml(s) {
  let out = "", i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "\\") {
      const m = /^\\([a-zA-Z]+)\*?/.exec(s.slice(i));
      if (m) {
        const cmd = m[1];
        if (cmd === "frac" || cmd === "dfrac" || cmd === "tfrac") {
          let k = i + m[0].length; while (s[k] === " ") k++;
          const g1 = readBraceGroup(s, k); let k2 = g1.end + 1; while (s[k2] === " ") k2++;
          const g2 = readBraceGroup(s, k2);
          out += `<span class="frac"><span class="fr-n">${mathToHtml(g1.content)}</span><span class="fr-d">${mathToHtml(g2.content)}</span></span>`;
          i = g2.end + 1; continue;
        }
        if (cmd === "sqrt") {
          let k = i + m[0].length, idx = "";
          if (s[k] === "[") { const e = s.indexOf("]", k); if (e > 0) { idx = mathToHtml(s.slice(k + 1, e)); k = e + 1; } }
          while (s[k] === " ") k++;
          const g = readBraceGroup(s, k);
          out += `<span class="sqrt">${idx ? `<sup class="sqrt-i">${idx}</sup>` : ""}<span class="radic">√</span><span class="rad">${mathToHtml(g.content)}</span></span>`;
          i = g.end + 1; continue;
        }
        if (cmd === "left" || cmd === "right") { i += m[0].length; continue; }
        if (cmd === "text" || cmd === "mathrm") {
          let k = i + m[0].length; while (s[k] === " ") k++;
          if (s[k] === "{") { const g = readBraceGroup(s, k); out += `<span class="mtext">${g.content}</span>`; i = g.end + 1; continue; }
        }
        if (Object.prototype.hasOwnProperty.call(MATH_SYM, cmd)) { out += MATH_SYM[cmd]; i += m[0].length; continue; }
        out += cmd; i += m[0].length; continue; // perintah tak dikenal: tampilkan namanya
      }
      out += "\\"; i++; continue;
    }
    if (ch === "^" || ch === "_") {
      const tag = ch === "^" ? "sup" : "sub";
      let k = i + 1, content;
      if (s[k] === "{") { const g = readBraceGroup(s, k); content = mathToHtml(g.content); i = g.end + 1; }
      else if (s[k] === "\\") { const m = /^\\([a-zA-Z]+)/.exec(s.slice(k)); if (m) { content = mathToHtml(s.slice(k, k + m[0].length)); i = k + m[0].length; } else { content = s[k] || ""; i = k + 1; } }
      else { content = s[k] || ""; i = k + 1; }
      out += `<${tag}>${content}</${tag}>`; continue;
    }
    if (ch === "{" || ch === "}") { i++; continue; }
    out += ch; i++;
  }
  return out;
}
// Render teks pengguna: HTML diamankan, lalu segmen $...$ diubah jadi rumus.
function renderMath(raw) {
  return escapeHtml(raw).replace(/\$([^$]+)\$/g, (_, m) => `<span class="math">${mathToHtml(m)}</span>`);
}
// Pembuat node yang isinya mendukung rumus.
function mathText(tag, cls, raw, extra) { return el(tag, Object.assign({ class: cls, html: renderMath(raw) }, extra || {})); }

function toast(msg) {
  let t = $(".toast");
  if (!t) { t = el("div", { class: "toast" }); document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2400);
}

function confirmModal(title, message, onYes, yesLabel = "Ya, hapus") {
  const overlay = el("div", { class: "modal-overlay" });
  const close = () => overlay.remove();
  overlay.appendChild(el("div", { class: "modal" }, [
    el("h3", {}, title),
    el("p", {}, message),
    el("div", { class: "btn-row", style: "justify-content:flex-end;margin-top:16px" }, [
      el("button", { class: "btn", onclick: close }, "Batal"),
      el("button", { class: "btn danger", onclick: () => { onYes(); close(); } }, yesLabel),
    ]),
  ]));
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.body.appendChild(overlay);
}

/* =========================================================================
   ROUTER
   ========================================================================= */
const app = () => document.getElementById("app");
let examState = null;
let examTimer = null;
let practiceState = null;
let _activeQ = null, _tickStart = 0; // pelacakan waktu per soal saat ujian

const NAV_VIEWS = ["home", "practice", "stats", "input", "bank", "materi", "achievements", "account"];
let currentView = "home";
function setNav(view) {
  document.querySelectorAll(".navbtn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
}
function go(view, arg) {
  currentView = view;
  setNav(NAV_VIEWS.includes(view) ? view : "");
  window.scrollTo(0, 0);
  if (view === "home") renderHome();
  else if (view === "practice") renderPractice(arg);
  else if (view === "stats") renderStats();
  else if (view === "input") renderInput(arg);
  else if (view === "bank") renderBank();
  else if (view === "materi") renderMateri();
  else if (view === "achievements") renderAchievements();
  else if (view === "exam") renderExam();
  else if (view === "result") renderResult(arg);
  else if (view === "account") renderAccount();
}
document.getElementById("mainnav").addEventListener("click", e => {
  const btn = e.target.closest(".navbtn");
  if (!btn) return;
  if (examState) {
    confirmModal("Keluar dari tryout?", "Tryout yang sedang berjalan akan dibatalkan dan jawaban hilang.",
      () => { stopTimer(); examState = null; clearExam(); go(btn.dataset.view); }, "Ya, keluar");
    return;
  }
  if (btn.dataset.view === currentView && !practiceState) return; // sudah di tab ini — tak perlu render ulang
  practiceState = null; // keluar dari sesi latihan jika sedang berjalan
  go(btn.dataset.view);
});

/* =========================================================================
   VIEW: HOME
   ========================================================================= */
function emptyState(icon, title, sub, action) {
  return el("div", { class: "card empty-state" }, [
    el("div", { class: "icon" }, icon), el("h3", {}, title), el("p", {}, sub), action || null,
  ]);
}

function totalMinutes(p) {
  if (p.mode === "sections") return subjectsOf(p.id).reduce((sum, s) => sum + (p.sectionMinutes[s] || DEFAULT_SECTION_MIN), 0);
  return p.durationMin;
}

function renderHome() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Paket Tryout"));
  root.appendChild(el("p", { class: "page-sub" }, "Pilih paket lalu kerjakan dalam mode ujian. Soal & pilihan diacak tiap kali diulang."));

  if (store.packages.length === 0) {
    root.appendChild(emptyState("📦", "Belum ada paket tryout", "Buat paket dan soalnya di menu Input Soal.",
      el("button", { class: "btn primary", onclick: () => go("input") }, "+ Buat Paket")));
    return;
  }

  const grid = el("div", { class: "grid" });
  store.packages.forEach(p => {
    const n = questionsOf(p.id).length;
    const subs = subjectsOf(p.id);
    const meta = [
      el("span", { class: "chip yellow" }, `📝 ${n} soal`),
      el("span", { class: "chip" }, `⏱ ${totalMinutes(p)} menit`),
      el("span", { class: "chip" }, p.mode === "sections" ? `🗂 ${subs.length} sesi` : "🕐 timer global"),
    ];
    const rec = store.records[p.id];
    if (rec && rec.best) meta.push(el("span", { class: "chip record" }, `🏅 Rekor ${rec.best.score} (${rec.best.pct}%)`));
    grid.appendChild(el("div", { class: "card pkg-card" }, [
      el("h3", {}, p.name),
      el("div", { class: "pkg-meta" }, meta),
      subs.length ? el("div", { class: "pkg-meta" }, subs.map(s =>
        el("span", { class: "tag" }, p.mode === "sections" ? `${s} · ${p.sectionMinutes[s] || DEFAULT_SECTION_MIN}m` : s))) : null,
      el("div", { class: "btn-row", style: "margin-top:auto" }, [
        el("button", { class: "btn primary", onclick: () => startExam(p.id), disabled: n === 0 ? "" : null },
          n === 0 ? "Belum ada soal" : "▶ Mulai Tryout"),
        el("button", { class: "btn sm", onclick: () => go("input", p.id) }, "Edit"),
      ]),
    ]));
  });
  root.appendChild(grid);
}

/* =========================================================================
   VIEW: INPUT SOAL
   ========================================================================= */
function field(label, input, hint) {
  return el("div", { class: "field" }, [
    el("label", {}, [label, hint ? el("span", { class: "hint" }, "  — " + hint) : null]),
    input,
  ]);
}

function renderInput(focusPkgId) {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Input Soal"));
  root.appendChild(el("p", { class: "page-sub" }, "Buat paket, atur mode waktu & mata uji, tambahkan soal. Langsung bisa dikerjakan di Beranda."));

  const select = el("select", { id: "pkgSelect" });
  store.packages.forEach(p => select.appendChild(el("option", { value: p.id }, `${p.name} (${questionsOf(p.id).length} soal)`)));
  if (focusPkgId) select.value = focusPkgId;
  select.addEventListener("change", () => renderInputFor(select.value));

  root.appendChild(el("div", { class: "toolbar" }, [
    el("label", { style: "font-weight:600" }, "Paket:"),
    select,
    el("button", { class: "btn sm", onclick: () => newPackage() }, "+ Paket Baru"),
    el("span", { class: "spacer" }),
    el("button", { class: "btn sm", onclick: exportJSON }, "⬇ Export"),
    el("button", { class: "btn sm", onclick: importJSON }, "⬆ Import"),
  ]));

  if (store.packages.length === 0) {
    root.appendChild(emptyState("📦", "Belum ada paket", "Buat paket dulu untuk menambahkan soal.",
      el("button", { class: "btn primary", onclick: () => newPackage() }, "+ Paket Baru")));
    return;
  }

  root.appendChild(el("div", { id: "inputContainer" }));
  renderInputFor(select.value);
}

function renderInputFor(pkgId) {
  const c = document.getElementById("inputContainer");
  if (!c) return;
  c.innerHTML = "";
  const pkg = pkgById(pkgId);
  if (!pkg) return;

  c.appendChild(buildPackageSettings(pkg));
  c.appendChild(buildQuestionForm(pkgId, null));

  // daftar soal
  const qs = questionsOf(pkgId);
  const list = el("div", { class: "card", style: "margin-top:18px;padding:0" });
  list.appendChild(el("div", { style: "padding:16px 18px;border-bottom:1px solid var(--border);font-weight:700" }, `Daftar Soal (${qs.length})`));
  if (qs.length === 0) {
    list.appendChild(el("div", { class: "empty-state", style: "padding:30px" }, "Belum ada soal pada paket ini."));
  } else {
    qs.forEach((q, i) => {
      list.appendChild(el("div", { class: "bank-item" }, [
        el("div", { class: "qn" }, `${i + 1}.`),
        el("div", { class: "body" }, [
          q.subject ? el("span", { class: "tag" }, q.subject) : null,
          el("div", { style: "margin:6px 0 4px;white-space:pre-wrap" }, truncate(q.text, 160)),
          el("div", { class: "ans" }, `Kunci: ${answerLetter(q)}. ${truncate(q.options[q.answer], 60)}`),
        ]),
        el("div", { class: "btn-row" }, [
          el("button", { class: "btn sm", onclick: () => openEditForm(pkgId, q.id) }, "Edit"),
          el("button", { class: "btn sm danger", onclick: () => confirmModal("Hapus soal?", "Soal ini akan dihapus permanen.", () => {
            store.questions = store.questions.filter(x => x.id !== q.id);
            saveStore(); toast("Soal dihapus"); renderInputFor(pkgId);
          }) }, "Hapus"),
        ]),
      ]));
    });
  }
  c.appendChild(list);
}

function buildPackageSettings(pkg) {
  const modeSel = el("select", { id: "pkgMode" }, [
    el("option", { value: "sections" }, "Per mata uji (sesi terpisah & terkunci)"),
    el("option", { value: "global" }, "Satu timer global (bebas berpindah)"),
  ]);
  modeSel.value = pkg.mode;
  modeSel.addEventListener("change", () => { pkg.mode = modeSel.value; saveStore(); renderInputFor(pkg.id); });

  const subs = subjectsOf(pkg.id);
  let timingBlock;
  if (pkg.mode === "global") {
    timingBlock = field("Durasi total (menit)", el("input", { type: "number", id: "pkgDur", min: "1", value: pkg.durationMin }));
  } else {
    const rows = subs.length
      ? subs.map(s => el("div", { class: "option-row" }, [
          el("span", { style: "flex:1;font-weight:600" }, s),
          el("input", { type: "number", min: "1", style: "max-width:120px", "data-subj": s, value: pkg.sectionMinutes[s] || DEFAULT_SECTION_MIN }),
          el("span", { style: "color:var(--ui-ink-soft);font-size:13px" }, "menit"),
        ]))
      : [el("div", { class: "note" }, "Tambahkan soal dengan mata uji dulu — durasi tiap mata uji akan muncul di sini.")];
    timingBlock = el("div", { class: "field" }, [
      el("label", {}, ["Durasi per mata uji ", el("span", { class: "hint" }, "— urutan sesi mengikuti urutan soal pertama tiap mata uji")]),
      ...rows,
    ]);
  }

  const shufQ = el("input", { type: "checkbox", id: "shufQ" }); if (pkg.shuffleQuestions) shufQ.checked = true;
  const shufO = el("input", { type: "checkbox", id: "shufO" }); if (pkg.shuffleOptions) shufO.checked = true;

  return el("div", { class: "card", style: "margin-bottom:18px" }, [
    el("h3", { style: "margin-top:0" }, "⚙️ Pengaturan Paket"),
    field("Nama paket", el("input", { type: "text", id: "pkgName", value: pkg.name })),
    field("Mode waktu", modeSel),
    timingBlock,
    el("div", { class: "field" }, [
      el("label", {}, "Pengacakan tiap percobaan"),
      el("label", { style: "font-weight:400;display:flex;gap:8px;align-items:center;margin-bottom:6px" }, [shufQ, "Acak urutan soal"]),
      el("label", { style: "font-weight:400;display:flex;gap:8px;align-items:center" }, [shufO, "Acak urutan pilihan jawaban"]),
    ]),
    el("div", { class: "btn-row" }, [
      el("button", { class: "btn sm primary", onclick: () => {
        pkg.name = $("#pkgName").value.trim() || pkg.name;
        if (pkg.mode === "global") pkg.durationMin = Math.max(1, parseInt($("#pkgDur").value) || pkg.durationMin);
        else document.querySelectorAll("[data-subj]").forEach(inp => {
          pkg.sectionMinutes[inp.getAttribute("data-subj")] = Math.max(1, parseInt(inp.value) || DEFAULT_SECTION_MIN);
        });
        pkg.shuffleQuestions = shufQ.checked;
        pkg.shuffleOptions = shufO.checked;
        saveStore(); toast("Pengaturan paket disimpan"); renderInput(pkg.id);
      } }, "Simpan Pengaturan"),
      el("button", { class: "btn sm danger", onclick: () => deletePackage(pkg.id) }, "Hapus Paket"),
    ]),
  ]);
}

function openEditForm(pkgId, qId) {
  renderInputFor(pkgId);
  const c = document.getElementById("inputContainer");
  const oldForm = c.querySelector(".question-form");
  const q = store.questions.find(x => x.id === qId);
  const newForm = buildQuestionForm(pkgId, q);
  oldForm.replaceWith(newForm);
  newForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function buildQuestionForm(pkgId, existing) {
  const data = existing || { subject: "", text: "", image: "", options: ["", "", "", "", ""], answer: 0, pembahasan: "" };
  let correctIdx = data.answer;

  const optionRows = OPT_KEYS.map((k, i) => {
    const keyBtn = el("button", { type: "button", class: "opt-key" + (i === correctIdx ? " correct" : ""), title: "Tandai sebagai kunci jawaban" }, k);
    const input = el("input", { type: "text", placeholder: `Pilihan ${k}`, value: data.options[i] || "" });
    keyBtn.addEventListener("click", () => {
      correctIdx = i;
      form.querySelectorAll(".opt-key").forEach((b, bi) => b.classList.toggle("correct", bi === i));
    });
    return el("div", { class: "option-row" }, [keyBtn, input]);
  });

  const subjectInput = el("input", { type: "text", placeholder: "mis. Kemampuan Verbal", value: data.subject || "", list: "subjlist" });
  const textInput = el("textarea", { placeholder: "Tulis pertanyaan di sini..." }, data.text || "");
  const imgInput = el("input", { type: "text", placeholder: "URL gambar (opsional)", value: data.image || "" });
  const pembInput = el("textarea", { placeholder: "Pembahasan / penjelasan jawaban (opsional)" }, data.pembahasan || "");

  const datalist = el("datalist", { id: "subjlist" });
  [...new Set([...PRESET_SUBJECTS, ...store.questions.map(q => q.subject).filter(Boolean)])]
    .forEach(s => datalist.appendChild(el("option", { value: s })));

  const isEdit = !!existing;
  const form = el("div", { class: "card question-form" }, [
    el("h3", { style: "margin-top:0" }, isEdit ? "✏️ Edit Soal" : "➕ Tambah Soal"),
    datalist,
    field("Mata uji / kategori", subjectInput, "ketik atau pilih"),
    field("Pertanyaan", textInput, "rumus: apit dengan $...$ — mis. $\\frac{a}{b}$, $x^2$, $\\sqrt{x}$, $\\pi$, $\\leq$"),
    field("Gambar", imgInput, "opsional, tempel link gambar"),
    el("div", { class: "field" }, [
      el("label", {}, ["Pilihan jawaban ", el("span", { class: "hint" }, "— klik huruf untuk menandai kunci jawaban")]),
      ...optionRows,
    ]),
    field("Pembahasan", pembInput),
    el("div", { class: "btn-row" }, [
      el("button", { class: "btn primary", onclick: () => {
        const opts = optionRows.map(r => r.querySelector("input").value.trim());
        const text = textInput.value.trim();
        if (!text) { toast("Pertanyaan tidak boleh kosong"); return; }
        if (opts.filter(o => o).length < 2) { toast("Isi minimal 2 pilihan jawaban"); return; }
        if (!opts[correctIdx]) { toast("Pilihan yang ditandai kunci masih kosong"); return; }
        const payload = { subject: subjectInput.value.trim(), text, image: imgInput.value.trim(), options: opts, answer: correctIdx, pembahasan: pembInput.value.trim() };
        if (isEdit) { Object.assign(existing, payload); toast("Soal diperbarui"); }
        else { store.questions.push({ id: uid(), packageId: pkgId, ...payload }); toast("Soal ditambahkan"); }
        saveStore(); renderInputFor(pkgId);
      } }, isEdit ? "Simpan Perubahan" : "Tambahkan Soal"),
      isEdit ? el("button", { class: "btn", onclick: () => renderInputFor(pkgId) }, "Batal") : null,
    ]),
  ]);
  return form;
}

function newPackage() {
  const id = uid();
  store.packages.push({ id, name: `Paket Baru ${store.packages.length + 1}`, mode: "sections", durationMin: 90, sectionMinutes: {}, shuffleQuestions: true, shuffleOptions: true, createdAt: Date.now() });
  saveStore(); go("input", id); toast("Paket baru dibuat");
}
function deletePackage(pkgId) {
  confirmModal("Hapus paket?", "Paket beserta semua soalnya akan dihapus permanen.", () => {
    store.packages = store.packages.filter(p => p.id !== pkgId);
    store.questions = store.questions.filter(q => q.packageId !== pkgId);
    saveStore(); toast("Paket dihapus"); go("input");
  });
}

/* ---------- Export / Import ---------- */
function exportJSON() {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const a = el("a", { href: URL.createObjectURL(blob), download: "tryout-simak-ui.json" });
  document.body.appendChild(a); a.click(); a.remove(); toast("Data diekspor");
}
// Gabungkan data import ke store yang ada (id paket & soal dibuat ulang agar tidak bentrok)
function mergeImported(data) {
  const idMap = {};
  data.packages.forEach(p => { const newId = uid(); idMap[p.id] = newId; p.id = newId; });
  const fallback = data.packages[0] ? data.packages[0].id : null;
  data.questions.forEach(q => { q.id = uid(); q.packageId = idMap[q.packageId] || fallback; });
  store.packages.push(...data.packages);
  store.questions.push(...data.questions);
}

function importJSON() {
  const input = el("input", { type: "file", accept: "application/json" });
  input.addEventListener("change", () => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = prepareImported(JSON.parse(reader.result));
        showImportChoice(data);
      } catch (e) { toast("File tidak valid"); }
    };
    reader.readAsText(file);
  });
  input.click();
}

function showImportChoice(data) {
  const np = data.packages.length, nq = data.questions.length;
  const overlay = el("div", { class: "modal-overlay" });
  const close = () => overlay.remove();
  overlay.appendChild(el("div", { class: "modal" }, [
    el("h3", {}, "Import data"),
    el("p", {}, `File berisi ${np} paket & ${nq} soal. Pilih cara import:`),
    el("div", { class: "note", style: "margin-bottom:16px" },
      "Tambahkan = paket baru digabung ke yang sudah ada (data lama aman). Ganti semua = seluruh data sekarang dihapus dan diganti isi file."),
    el("div", { class: "btn-row", style: "justify-content:flex-end" }, [
      el("button", { class: "btn", onclick: close }, "Batal"),
      el("button", { class: "btn danger", onclick: () => {
        store = data; saveStore(); close(); toast("Data diganti seluruhnya"); go("input");
      } }, "Ganti semua"),
      el("button", { class: "btn primary", onclick: () => {
        mergeImported(data); saveStore(); close(); toast(`${np} paket ditambahkan`); go("input", store.packages[store.packages.length - 1].id);
      } }, "Tambahkan"),
    ]),
  ]));
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.body.appendChild(overlay);
}

/* =========================================================================
   VIEW: BANK SOAL
   ========================================================================= */
/* Blok "Materi & Pembahasan" untuk satu soal di Bank Soal. */
function questionMateri(q) {
  const m = MATERI[q.subject];
  const kids = [];

  kids.push(q.pembahasan
    ? el("div", { class: "pembahasan", style: "margin-top:0" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })])
    : el("div", { class: "note", style: "margin-top:0" }, "Belum ada pembahasan untuk soal ini. Tambahkan lewat menu Input Soal → Edit."));

  if (m) {
    kids.push(el("div", { class: "materi-ref" }, [
      el("div", { style: "font-size:13px;margin-bottom:6px" },
        [el("span", { class: "materi-ic", style: "font-size:18px;margin-right:6px" }, m.icon),
         el("strong", {}, "Materi terkait: "), q.subject]),
      el("ul", { class: "materi-list" }, m.topics.map(t => el("li", {}, t.h))),
      el("button", { class: "btn sm", style: "margin-top:8px", onclick: () => go("materi") }, "📘 Buka materi lengkap →"),
    ]));
  }

  return el("details", { class: "bank-materi" }, [
    el("summary", {}, "📖 Materi & Pembahasan"),
    el("div", { class: "bank-materi-body" }, kids),
  ]);
}

function renderBank() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Bank Soal"));
  root.appendChild(el("p", { class: "page-sub" }, "Seluruh soal yang tersimpan, dikelompokkan per paket."));
  if (store.questions.length === 0) {
    root.appendChild(emptyState("🗂", "Bank soal kosong", "Tambahkan soal lewat menu Input Soal.",
      el("button", { class: "btn primary", onclick: () => go("input") }, "Input Soal")));
    return;
  }
  store.packages.forEach(p => {
    const qs = questionsOf(p.id);
    if (qs.length === 0) return;
    const card = el("div", { class: "card", style: "margin-bottom:18px;padding:0" });
    card.appendChild(el("div", { style: "padding:16px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px" }, [
      el("strong", {}, `${p.name} · ${qs.length} soal · ${totalMinutes(p)} menit`),
      el("button", { class: "btn sm primary", onclick: () => startExam(p.id) }, "▶ Tryout"),
    ]));
    qs.forEach((q, i) => card.appendChild(el("div", { class: "bank-item" }, [
      el("div", { class: "qn" }, `${i + 1}.`),
      el("div", { class: "body" }, [
        q.subject ? el("span", { class: "tag" }, q.subject) : null,
        el("div", { style: "margin:6px 0;white-space:pre-wrap", html: renderMath(q.text) }),
        el("div", { class: "ans", html: `Kunci: ${answerLetter(q)}. ${renderMath(q.options[q.answer])}` }),
        questionMateri(q),
      ]),
    ])));
    root.appendChild(card);
  });
}

/* =========================================================================
   VIEW: MATERI
   ========================================================================= */
function subjectCounts() {
  const counts = {};
  store.questions.forEach(q => { const s = q.subject || "Lainnya"; counts[s] = (counts[s] || 0) + 1; });
  return counts;
}

function materiCard(subject, count) {
  const m = MATERI[subject];
  const head = el("summary", { class: "materi-head" }, [
    el("span", { class: "materi-ic" }, m ? m.icon : "📘"),
    el("span", { class: "materi-title" }, subject),
    count != null ? el("span", { class: "chip yellow" }, `${count} soal`) : null,
  ]);

  const body = el("div", { class: "materi-body" });
  if (m) {
    body.appendChild(el("p", { class: "materi-intro" }, m.intro));

    // Fondasi ilmu & cara belajar (pengetahuan dasar) — opsional per mata uji
    if (m.guide && m.guide.length) {
      body.appendChild(el("div", { class: "materi-section-label" }, "📚 Pengetahuan Dasar & Cara Belajar"));
      m.guide.forEach(g => {
        body.appendChild(el("h4", { class: "materi-topic" }, g.h));
        if (g.body) body.appendChild(el("p", { class: "materi-guide-body" }, g.body));
        if (g.points) body.appendChild(el("ul", { class: "materi-list" }, g.points.map(p => el("li", {}, p))));
        if (g.example) body.appendChild(el("div", { class: "materi-example" }, [el("strong", {}, "Contoh: "), g.example]));
      });
      body.appendChild(el("div", { class: "materi-section-label" }, "🎯 Topik Soal & Strategi"));
    }

    m.topics.forEach(t => {
      body.appendChild(el("h4", { class: "materi-topic" }, t.h));
      body.appendChild(el("ul", { class: "materi-list" }, t.points.map(p => el("li", {}, p))));
      if (t.example) body.appendChild(el("div", { class: "materi-example" }, [el("strong", {}, "Contoh soal: "), t.example]));
    });
  } else {
    body.appendChild(el("p", { class: "materi-intro" },
      "Belum ada materi bawaan untuk jenis soal ini. Pelajari pola soalnya langsung di Bank Soal beserta kunci & pembahasan."));
  }
  if (count != null && count > 0) {
    body.appendChild(el("div", { class: "btn-row", style: "margin-top:14px" }, [
      el("button", { class: "btn sm", onclick: () => go("bank") }, "Lihat soal di Bank Soal →"),
    ]));
  }

  return el("details", { class: "card materi-card", open: "" }, [head, body]);
}

function renderMateri() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Materi"));
  root.appendChild(el("p", { class: "page-sub" }, "Ringkasan materi & strategi untuk tiap jenis soal yang ada di bank soalmu."));

  const counts = subjectCounts();
  const subjects = Object.keys(counts);

  if (subjects.length === 0) {
    // Bank kosong → tampilkan seluruh materi bawaan sebagai panduan umum
    root.appendChild(el("div", { class: "note", style: "margin-bottom:18px" },
      "Bank soal masih kosong. Berikut materi umum jenis soal standar SIMAK UI. Tambahkan soal di menu Input Soal agar materi menyesuaikan jenis soalmu."));
    Object.keys(MATERI).forEach(s => root.appendChild(materiCard(s, null)));
    return;
  }

  // Materi untuk jenis soal yang benar-benar ada (urut: preset dulu, lalu sisanya)
  const ordered = [
    ...Object.keys(MATERI).filter(s => subjects.includes(s)),
    ...subjects.filter(s => !MATERI[s]),
  ];
  ordered.forEach(s => root.appendChild(materiCard(s, counts[s])));
}

/* =========================================================================
   VIEW: PENCAPAIAN (Achievements & Rekor)
   ========================================================================= */
function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch (e) { return ""; }
}

function renderAchievements() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Pencapaian"));
  root.appendChild(el("p", { class: "page-sub" }, "Kumpulkan badge dan kejar rekor skor tertinggimu di tiap paket."));

  const unlocked = ACHIEVEMENTS.filter(a => store.achievements[a.id]).length;
  const totalAttempts = Object.values(store.records).reduce((a, x) => a + (x.attempts || 0), 0);

  // ----- Ringkasan -----
  root.appendChild(el("div", { class: "ach-summary" }, [
    el("div", { class: "ach-stat" }, [el("b", {}, `${unlocked}/${ACHIEVEMENTS.length}`), el("span", {}, "Badge terbuka")]),
    el("div", { class: "ach-stat" }, [el("b", {}, String(totalAttempts)), el("span", {}, "Tryout selesai")]),
    el("div", { class: "ach-stat" }, [el("b", {}, String(Object.keys(store.records).length)), el("span", {}, "Paket dikerjakan")]),
  ]));

  // ----- Grid badge -----
  const grid = el("div", { class: "ach-grid" });
  ACHIEVEMENTS.forEach(a => {
    const at = store.achievements[a.id];
    grid.appendChild(el("div", { class: "ach-badge" + (at ? " unlocked" : " locked") }, [
      el("div", { class: "ach-ic" }, at ? a.icon : "🔒"),
      el("div", { class: "ach-info" }, [
        el("strong", {}, a.name),
        el("span", {}, a.desc),
        at ? el("span", { class: "ach-date" }, "Terbuka " + fmtDate(at)) : null,
      ]),
    ]));
  });
  root.appendChild(el("div", { class: "card", style: "margin-bottom:18px" }, [
    el("h3", { style: "margin-top:0" }, "Badge"),
    grid,
  ]));

  // ----- Rekor per paket -----
  const recEntries = store.packages.filter(p => store.records[p.id] && store.records[p.id].best);
  if (recEntries.length === 0) {
    root.appendChild(el("div", { class: "note" }, "Belum ada rekor. Selesaikan sebuah tryout di Beranda untuk mencatat skor tertinggi pertamamu."));
  } else {
    const card = el("div", { class: "card", style: "padding:0" });
    card.appendChild(el("div", { style: "padding:16px 18px;border-bottom:1px solid var(--border);font-weight:700" }, "🏅 Rekor Tertinggi per Paket"));
    const table = el("table", { class: "subj" });
    table.appendChild(el("tr", {}, [el("th", {}, "Paket"), el("th", {}, "Rekor"), el("th", {}, "%"), el("th", {}, "Percobaan"), el("th", {}, "Tanggal"), el("th", {}, "")]));
    recEntries.forEach(p => {
      const rec = store.records[p.id];
      table.appendChild(el("tr", {}, [
        el("td", {}, p.name),
        el("td", {}, String(rec.best.score)),
        el("td", {}, rec.best.pct + "%"),
        el("td", {}, String(rec.attempts)),
        el("td", {}, fmtDate(rec.best.date)),
        el("td", {}, el("button", { class: "btn sm danger", title: "Hapus rekor paket ini",
          onclick: () => confirmModal("Hapus rekor paket ini?",
            `Rekor & riwayat untuk "${p.name}" akan dihapus. Badge tidak terpengaruh.`, () => {
              delete store.records[p.id];
              saveStore(); toast("Rekor paket dihapus"); renderAchievements();
            }, "Ya, hapus") }, "Hapus")),
      ]));
    });
    card.appendChild(table);
    root.appendChild(card);

    root.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
      el("button", { class: "btn sm danger", onclick: () => confirmModal("Reset rekor & pencapaian?",
        "Semua rekor skor, riwayat, dan badge yang terbuka akan dihapus permanen. Soal & paket tidak terpengaruh.", () => {
          store.records = {}; store.achievements = {};
          saveStore(); toast("Rekor & pencapaian direset"); renderAchievements();
        }, "Ya, reset") }, "Reset rekor & pencapaian"),
    ]));
  }
}

/* =========================================================================
   EXAM ENGINE
   ========================================================================= */
function prepareQuestion(q, shuffleOpts) {
  // order = daftar indeks pilihan (non-kosong) dalam urutan tampil
  let order = q.options.map((o, i) => ({ o, i })).filter(x => x.o.trim() !== "").map(x => x.i);
  if (shuffleOpts) order = shuffle(order);
  return { ...q, order };
}

function buildSections(pkg, qs) {
  if (pkg.mode === "sections") {
    const order = [], map = {};
    qs.forEach(q => { const s = q.subject || "Lainnya"; if (!map[s]) { map[s] = []; order.push(s); } map[s].push(q); });
    return order.map(s => ({ subject: s, minutes: pkg.sectionMinutes[s] || DEFAULT_SECTION_MIN, qs: map[s] }));
  }
  return [{ subject: null, minutes: pkg.durationMin, qs }];
}

function startExam(pkgId) {
  const pkg = pkgById(pkgId);
  const qs = questionsOf(pkgId);
  if (!pkg || qs.length === 0) { toast("Paket belum punya soal"); return; }

  const sections = buildSections(pkg, qs).map(sec => {
    let list = sec.qs.map(q => ({ ...q }));
    if (pkg.shuffleQuestions) list = shuffle(list);
    const prepared = list.map(q => prepareQuestion(q, pkg.shuffleOptions));
    return {
      subject: sec.subject, minutes: sec.minutes, questions: prepared,
      answers: new Array(prepared.length).fill(null),
      flags: new Array(prepared.length).fill(false),
      timeSpent: new Array(prepared.length).fill(0),
      endsAt: null, done: false,
    };
  });

  examState = { pkgId, pkgName: pkg.name, mode: pkg.mode, sections, si: 0, qi: 0 };
  sections[0].endsAt = Date.now() + sections[0].minutes * 60000;
  persistExam();
  go("exam");
}

function curSec() { return examState.sections[examState.si]; }
// Akumulasikan waktu yang dihabiskan pada soal yang sedang aktif sebelum berpindah.
function accrueTime() {
  if (!examState || _tickStart === 0 || !_activeQ) { _tickStart = 0; _activeQ = null; return; }
  const sec = examState.sections[_activeQ.si];
  if (sec && sec.timeSpent) sec.timeSpent[_activeQ.qi] = (sec.timeSpent[_activeQ.qi] || 0) + (Date.now() - _tickStart);
  _tickStart = 0; _activeQ = null;
}
function stopTimer() { if (examTimer) { clearInterval(examTimer); examTimer = null; } }

function startTimer() {
  stopTimer();
  const tick = () => {
    const t = document.getElementById("timer");
    if (!t || !examState) { stopTimer(); return; }
    const remain = Math.max(0, curSec().endsAt - Date.now());
    t.textContent = fmtTime(remain);
    t.classList.toggle("warn", remain <= 300000 && remain > 60000);
    t.classList.toggle("danger", remain <= 60000);
    if (remain <= 0) { stopTimer(); onSectionTimeout(); }
  };
  tick();
  examTimer = setInterval(tick, 250);
}

function onSectionTimeout() {
  curSec().done = true;
  if (examState.si < examState.sections.length - 1) {
    toast("Waktu sesi habis — lanjut ke mata uji berikutnya");
    advanceSection();
  } else { toast("Waktu habis!"); finishExam(); }
}
function advanceSection() {
  accrueTime();
  examState.si++; examState.qi = 0;
  curSec().endsAt = Date.now() + curSec().minutes * 60000;
  persistExam();
  renderExam();
}

function renderExam() {
  const root = app();
  root.innerHTML = "";
  const s = examState;
  const sec = curSec();
  const isSections = s.mode === "sections";

  const titleBits = [el("h2", { class: "page-title", style: "margin:0" }, s.pkgName)];
  if (isSections) titleBits.push(el("div", { class: "q-meta" }, `Mata Uji: ${sec.subject} · Sesi ${s.si + 1} dari ${s.sections.length}`));
  titleBits.push(el("div", { class: "q-meta", id: "progressText" }, ""));

  root.appendChild(el("div", { class: "exam-header" }, [
    el("div", {}, titleBits),
    el("div", { class: "timer", id: "timer" }, "--:--"),
  ]));

  if (isSections) root.appendChild(el("div", { class: "note", style: "margin-bottom:14px" },
    "Mode sesi: setelah pindah mata uji kamu tidak bisa kembali ke mata uji sebelumnya."));

  const layout = el("div", { class: "exam-layout" });
  layout.appendChild(el("div", { id: "examMain" }));

  const sideChildren = [
    el("strong", {}, isSections ? `Navigasi · ${sec.subject}` : "Navigasi Soal"),
    el("div", { class: "nav-grid", id: "navGrid" }),
    el("div", { class: "legend" }, [
      el("span", { class: "l-ans" }, "Sudah dijawab"),
      el("span", { class: "l-flag" }, "Ragu-ragu"),
      el("span", { class: "l-empty" }, "Belum dijawab"),
    ]),
    el("div", { class: "kbd-hint" }, "⌨️ Pintasan: 1–5 / A–E pilih jawaban · ← → pindah soal · F tandai ragu"),
  ];
  if (isSections) {
    sideChildren.push(el("div", { class: "divider" }));
    sideChildren.push(el("div", { style: "font-size:13px;display:grid;gap:4px" },
      s.sections.map((sc, i) => el("div", { style: "color:" + (i === s.si ? "var(--ui-ink)" : "var(--ui-ink-soft)") + ";font-weight:" + (i === s.si ? "700" : "400") },
        `${i < s.si ? "✓" : i === s.si ? "▶" : "🔒"} ${sc.subject} (${sc.minutes}m)`))));
  }
  sideChildren.push(el("div", { class: "divider" }));
  const lastSection = s.si === s.sections.length - 1;
  sideChildren.push(el("button", { class: "btn dark", style: "width:100%", onclick: confirmFinishSection },
    isSections && !lastSection ? "Selesaikan Sesi →" : "Selesai & Lihat Hasil"));

  layout.appendChild(el("div", {}, [el("div", { class: "card sidebar-card" }, sideChildren)]));
  root.appendChild(layout);

  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const s = examState, sec = curSec(), i = s.qi, q = sec.questions[i];
  accrueTime();                                   // catat waktu soal sebelumnya
  _activeQ = { si: s.si, qi: i }; _tickStart = Date.now();
  const main = document.getElementById("examMain");
  main.innerHTML = "";

  const card = el("div", { class: "card" }, [
    el("div", { class: "q-meta" }, [
      el("span", {}, `Soal ${i + 1} dari ${sec.questions.length}`),
      q.subject ? el("span", { class: "tag", style: "margin-left:8px" }, q.subject) : null,
    ]),
    mathText("div", "q-text", q.text),
    q.image ? el("img", { class: "q-img", src: q.image, alt: "gambar soal", onerror: function () { this.style.display = "none"; } }) : null,
  ]);

  q.order.forEach((origIdx, displayIdx) => {
    const selected = sec.answers[i] === displayIdx;
    const choice = el("div", { class: "choice" + (selected ? " selected" : "") }, [
      el("div", { class: "key" }, OPT_KEYS[displayIdx]),
      mathText("div", "ctext", q.options[origIdx]),
    ]);
    choice.addEventListener("click", () => {
      sec.answers[i] = (sec.answers[i] === displayIdx) ? null : displayIdx;
      persistExam(); renderQuestion(); updateNav(); updateProgress();
    });
    card.appendChild(choice);
  });

  const flagged = sec.flags[i];
  const lastQ = i === sec.questions.length - 1;
  const lastSection = s.si === s.sections.length - 1;
  card.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
    el("button", { class: "btn", onclick: () => { s.qi = Math.max(0, i - 1); renderQuestion(); updateNav(); }, disabled: i === 0 ? "" : null }, "← Sebelumnya"),
    el("button", { class: "btn" + (flagged ? " primary" : ""), onclick: () => { sec.flags[i] = !sec.flags[i]; persistExam(); renderQuestion(); updateNav(); } }, flagged ? "★ Ditandai" : "☆ Ragu-ragu"),
    el("button", { class: "btn", onclick: () => { sec.answers[i] = null; persistExam(); renderQuestion(); updateNav(); updateProgress(); } }, "Bersihkan"),
    el("span", { style: "flex:1" }),
    !lastQ
      ? el("button", { class: "btn dark", onclick: () => { s.qi = i + 1; renderQuestion(); updateNav(); } }, "Selanjutnya →")
      : el("button", { class: "btn dark", onclick: confirmFinishSection }, (s.mode === "sections" && !lastSection) ? "Selesaikan Sesi →" : "Selesai →"),
  ]));
  main.appendChild(card);
  updateNav(); updateProgress();
}

function updateNav() {
  const grid = document.getElementById("navGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const sec = curSec();
  sec.questions.forEach((_, i) => {
    let cls = "nav-cell";
    if (sec.answers[i] !== null) cls += " answered";
    if (sec.flags[i]) cls += " flagged";
    if (i === examState.qi) cls += " current";
    grid.appendChild(el("button", { class: cls, onclick: () => { examState.qi = i; renderQuestion(); updateNav(); } }, String(i + 1)));
  });
}
function updateProgress() {
  const p = document.getElementById("progressText");
  if (!p) return;
  const sec = curSec();
  p.textContent = `Terjawab ${sec.answers.filter(a => a !== null).length}/${sec.questions.length}`;
}

function confirmFinishSection() {
  const s = examState, sec = curSec();
  const answered = sec.answers.filter(a => a !== null).length;
  const lastSection = s.si === s.sections.length - 1;
  if (s.mode === "sections" && !lastSection) {
    const next = s.sections[s.si + 1].subject;
    confirmModal("Selesaikan sesi ini?",
      `Kamu menjawab ${answered}/${sec.questions.length} soal "${sec.subject}". Setelah lanjut kamu TIDAK bisa kembali ke mata uji ini. Lanjut ke "${next}"?`,
      () => { sec.done = true; advanceSection(); }, "Ya, lanjut");
  } else {
    confirmFinish();
  }
}
function confirmFinish() {
  const total = examState.sections.reduce((a, sc) => a + sc.questions.length, 0);
  const answered = examState.sections.reduce((a, sc) => a + sc.answers.filter(x => x !== null).length, 0);
  confirmModal("Selesaikan tryout?", `Total terjawab ${answered} dari ${total} soal. Akhiri dan lihat hasil?`, finishExam, "Ya, selesai");
}

function finishExam() {
  stopTimer();
  accrueTime();
  const s = examState;
  if (!s) return;
  let correct = 0, wrong = 0, empty = 0, totalTimeMs = 0;
  const bySubject = {};
  s.sections.forEach(sec => {
    sec.questions.forEach((q, i) => {
      const subj = q.subject || sec.subject || "Lainnya";
      bySubject[subj] = bySubject[subj] || { correct: 0, wrong: 0, empty: 0, total: 0, timeMs: 0 };
      bySubject[subj].total++;
      const t = (sec.timeSpent && sec.timeSpent[i]) || 0;
      bySubject[subj].timeMs += t; totalTimeMs += t;
      const d = sec.answers[i];
      let outcome;
      if (d === null) { empty++; bySubject[subj].empty++; outcome = "empty"; }
      else if (q.order[d] === q.answer) { correct++; bySubject[subj].correct++; outcome = "correct"; }
      else { wrong++; bySubject[subj].wrong++; outcome = "wrong"; }
      recordQStat(q.id, outcome, t);
    });
  });
  const score = correct * SCORE.correct + wrong * SCORE.wrong;
  const totalQ = correct + wrong + empty;
  const result = { pkgId: s.pkgId, pkgName: s.pkgName, mode: s.mode, sections: s.sections, correct, wrong, empty, score, maxScore: totalQ * SCORE.correct, bySubject, totalTimeMs };
  result.completion = processCompletion(result);
  examState = null;
  clearExam();
  go("result", result);
}

/* Catat hasil ke rekor paket, perbarui rekor tertinggi, dan buka achievement.
   Mengembalikan info untuk ditampilkan di halaman hasil. */
function processCompletion(r) {
  const now = Date.now();
  const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;

  const rec = store.records[r.pkgId] || { best: null, attempts: 0, history: [] };
  const prevBest = rec.best;
  rec.attempts++;
  let isNewRecord = false;
  if (prevBest == null || r.score > prevBest.score) {
    rec.best = { score: r.score, pct, maxScore: r.maxScore, date: now };
    if (prevBest != null) isNewRecord = true; // hanya "pecah rekor" jika sudah pernah ada rekor
  }
  rec.lastScore = r.score;
  const subjSnap = {};
  Object.entries(r.bySubject || {}).forEach(([s, d]) => { subjSnap[s] = { correct: d.correct, wrong: d.wrong, empty: d.empty, total: d.total }; });
  rec.history.push({ date: now, score: r.score, pct, correct: r.correct, wrong: r.wrong, empty: r.empty, maxScore: r.maxScore, durationMs: r.totalTimeMs || 0, bySubject: subjSnap });
  if (rec.history.length > 20) rec.history = rec.history.slice(-20);
  store.records[r.pkgId] = rec;

  const totalAttempts = Object.values(store.records).reduce((a, x) => a + (x.attempts || 0), 0);
  const perfectSubject = Object.values(r.bySubject).some(d => d.total > 0 && d.correct === d.total);

  const checks = {
    first_try: true,
    full_house: r.empty === 0,
    flawless: r.wrong === 0 && r.correct > 0,
    perfect_subject: perfectSubject,
    high_scorer: pct >= 80,
    sharp_shooter: pct >= 95,
    new_record: isNewRecord,
    persistent: totalAttempts >= 5,
    marathon: totalAttempts >= 10,
  };

  const newly = [];
  ACHIEVEMENTS.forEach(a => {
    if (checks[a.id] && !store.achievements[a.id]) {
      store.achievements[a.id] = now;
      newly.push(a);
    }
  });

  saveStore();
  return { isNewRecord, prevBest, best: rec.best, attempts: rec.attempts, pct, newly };
}

/* =========================================================================
   VIEW: RESULT
   ========================================================================= */
function renderResult(r) {
  const root = app();
  root.innerHTML = "";
  const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;

  root.appendChild(el("div", { class: "score-hero" }, [
    el("div", {}, "Skor Tryout"),
    el("div", { class: "big" }, String(r.score)),
    el("div", {}, `dari maksimal ${r.maxScore} · ${pct}%`),
    el("div", { class: "stat-row" }, [
      el("div", {}, [el("b", { style: "color:#86efac" }, String(r.correct)), "Benar (+4)"]),
      el("div", {}, [el("b", { style: "color:#fca5a5" }, String(r.wrong)), "Salah (−1)"]),
      el("div", {}, [el("b", { style: "color:#cbd5e1" }, String(r.empty)), "Kosong (0)"]),
    ]),
  ]));

  // ----- Rekor & pencapaian baru -----
  const c = r.completion;
  if (c) {
    if (c.isNewRecord) {
      root.appendChild(el("div", { class: "record-banner new" }, [
        el("span", { class: "rb-icon" }, "📈"),
        el("div", {}, [
          el("strong", {}, "Rekor Baru! 🎉"),
          el("div", { style: "font-size:13px" }, `Skor ${r.score} memecahkan rekor sebelumnya (${c.prevBest.score}).`),
        ]),
      ]));
    } else if (c.best) {
      const tie = c.best.score === r.score;
      root.appendChild(el("div", { class: "record-banner" }, [
        el("span", { class: "rb-icon" }, "🏅"),
        el("div", {}, [
          el("strong", {}, tie && c.attempts === 1 ? "Skor pertamamu di paket ini" : "Rekor tertinggi paket ini"),
          el("div", { style: "font-size:13px" }, `${c.best.score} (${c.best.pct}%) · sudah dikerjakan ${c.attempts}×`),
        ]),
      ]));
    }

    if (c.newly.length) {
      const badges = el("div", { class: "ach-grid" });
      c.newly.forEach(a => badges.appendChild(el("div", { class: "ach-badge unlocked" }, [
        el("div", { class: "ach-ic" }, a.icon),
        el("div", { class: "ach-info" }, [el("strong", {}, a.name), el("span", {}, a.desc)]),
      ])));
      root.appendChild(el("div", { class: "card", style: "margin-bottom:18px;border-color:var(--ui-yellow-dark)" }, [
        el("h3", { style: "margin-top:0" }, `🎁 Pencapaian Baru Terbuka (${c.newly.length})`),
        badges,
      ]));
    }
  }

  const hasTime = (r.totalTimeMs || 0) > 0;
  const tableCard = el("div", { class: "card", style: "margin-bottom:18px" }, [el("h3", { style: "margin-top:0" }, "Rincian per Mata Uji")]);
  const table = el("table", { class: "subj" });
  table.appendChild(el("tr", {}, [el("th", {}, "Mata Uji"), el("th", {}, "Benar"), el("th", {}, "Salah"), el("th", {}, "Kosong"), el("th", {}, "Skor"), hasTime ? el("th", {}, "Waktu/soal") : null]));
  Object.entries(r.bySubject).forEach(([subj, d]) => {
    const sc = d.correct * SCORE.correct + d.wrong * SCORE.wrong;
    table.appendChild(el("tr", {}, [el("td", {}, subj), el("td", {}, String(d.correct)), el("td", {}, String(d.wrong)), el("td", {}, String(d.empty)), el("td", {}, String(sc)),
      hasTime ? el("td", {}, d.total ? fmtDur(d.timeMs / d.total) : "–") : null]));
  });
  tableCard.appendChild(table);
  if (hasTime) tableCard.appendChild(el("div", { class: "q-meta", style: "margin-top:10px" }, `⏱ Total waktu pengerjaan: ${fmtDur(r.totalTimeMs)}`));
  root.appendChild(tableCard);

  // Tindak lanjut: latih soal yang salah & lihat statistik
  if (r.wrong > 0 || r.empty > 0) {
    root.appendChild(el("div", { class: "btn-row", style: "margin:0 0 18px" }, [
      el("button", { class: "btn", onclick: () => startPractice("wrong", { title: "Ulang soal yang salah" }) }, "🎯 Latih soal yang salah"),
      el("button", { class: "btn", onclick: () => go("stats") }, "📊 Lihat statistik"),
    ]));
  }

  const actions = () => el("div", { class: "btn-row", style: "margin:0 0 22px" }, [
    el("button", { class: "btn primary", onclick: () => startExam(r.pkgId) }, "🔁 Ulangi Tryout"),
    el("button", { class: "btn", onclick: () => go("home") }, "Kembali ke Beranda"),
  ]);
  root.appendChild(actions());

  root.appendChild(el("h3", {}, "Pembahasan"));
  let no = 0;
  r.sections.forEach(sec => {
    if (r.mode === "sections" && sec.subject)
      root.appendChild(el("h4", { style: "margin:18px 0 8px;color:var(--ui-ink-soft)" }, `Mata Uji: ${sec.subject}`));
    sec.questions.forEach((q, i) => {
      no++;
      const d = sec.answers[i];
      const status = d === null
        ? el("span", { class: "tag", style: "margin-left:8px;background:#fee2e2;color:#dc2626" }, "Tidak dijawab")
        : q.order[d] === q.answer
          ? el("span", { class: "tag", style: "margin-left:8px;background:#dcfce7;color:#16a34a" }, "Benar")
          : el("span", { class: "tag", style: "margin-left:8px;background:#fee2e2;color:#dc2626" }, "Salah");
      const star = el("button", { class: "bookmark-btn" + (isBookmarked(q.id) ? " on" : ""), title: "Tandai untuk dilatih lagi" },
        isBookmarked(q.id) ? "★ Ditandai" : "☆ Tandai");
      star.addEventListener("click", () => {
        const on = toggleBookmark(q.id);
        star.classList.toggle("on", on);
        star.textContent = on ? "★ Ditandai" : "☆ Tandai";
      });
      const card = el("div", { class: "card review-q" }, [
        el("div", { class: "q-meta", style: "display:flex;align-items:center;gap:8px" }, [el("strong", {}, `Soal ${no}`), status, el("span", { style: "flex:1" }), star]),
        mathText("div", "q-text", q.text),
        q.image ? el("img", { class: "q-img", src: q.image, onerror: function () { this.style.display = "none"; } }) : null,
      ]);
      q.order.forEach((origIdx, displayIdx) => {
        let cls = "choice";
        const isCorrect = origIdx === q.answer;
        const isChosen = displayIdx === d;
        if (isCorrect) cls += " correct";
        else if (isChosen) cls += " wrong";
        card.appendChild(el("div", { class: cls }, [
          el("div", { class: "key" }, OPT_KEYS[displayIdx]),
          el("div", { class: "ctext", html: renderMath(q.options[origIdx]) + (isCorrect ? "  ✓ kunci" : (isChosen ? "  ✗ jawabanmu" : "")) }),
        ]));
      });
      if (q.pembahasan) card.appendChild(el("div", { class: "pembahasan" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })]));
      root.appendChild(card);
    });
  });
  root.appendChild(actions());
}

/* =========================================================================
   VIEW: STATISTIK
   ========================================================================= */
function statCard(icon, value, label) {
  return el("div", { class: "stat-card" }, [
    el("div", { class: "sc-ic" }, icon),
    el("div", {}, [el("div", { class: "sc-val" }, String(value)), el("div", { class: "sc-lbl" }, label)]),
  ]);
}
function accTone(acc) { return acc == null ? "mid" : acc >= 75 ? "good" : acc >= 50 ? "mid" : "bad"; }
function barChart(pcts, labels) {
  const wrap = el("div", { class: "bar-chart" });
  pcts.forEach((pct, i) => {
    const v = Math.max(2, Math.min(100, pct));
    wrap.appendChild(el("div", { class: "bar-col", title: (labels ? labels[i] + " · " : "") + pct + "%" }, [
      el("div", { class: "bar-val" }, pct + "%"),
      el("div", { class: "bar" }, [el("div", { class: "bar-fill " + accTone(pct), style: `height:${v}%` })]),
      el("div", { class: "bar-x" }, "#" + (i + 1)),
    ]));
  });
  return wrap;
}
function renderStats() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Statistik Belajar"));
  root.appendChild(el("p", { class: "page-sub" }, "Lacak perkembanganmu, temukan mata uji yang lemah, lalu latih dengan tepat."));

  const totalAttempts = Object.values(store.records).reduce((a, r) => a + (r.attempts || 0), 0);
  const qstatVals = Object.values(store.qstats);
  const sumSeen = qstatVals.reduce((a, s) => a + s.seen, 0);
  const sumCorrect = qstatVals.reduce((a, s) => a + s.correct, 0);
  const sumAnswered = qstatVals.reduce((a, s) => a + s.correct + s.wrong, 0);
  const overallAcc = sumAnswered > 0 ? Math.round((sumCorrect / sumAnswered) * 100) : null;
  const streak = computeStreak();

  if (totalAttempts === 0 && sumSeen === 0) {
    root.appendChild(emptyState("📊", "Belum ada data statistik",
      "Kerjakan tryout atau latihan dulu — perkembanganmu akan terekam otomatis di sini.",
      el("button", { class: "btn primary", onclick: () => go("home") }, "Mulai Tryout")));
    return;
  }

  root.appendChild(el("div", { class: "stat-cards" }, [
    statCard("🔥", streak, "hari beruntun"),
    statCard("📝", totalAttempts, "tryout selesai"),
    statCard("🎯", overallAcc == null ? "–" : overallAcc + "%", "akurasi keseluruhan"),
    statCard("📚", sumSeen, "soal dikerjakan"),
  ]));

  // ----- Penguasaan per mata uji (terlemah di atas) -----
  const mastery = subjectMastery().filter(m => m.attempts > 0).sort((a, b) => (a.accuracy ?? 999) - (b.accuracy ?? 999));
  if (mastery.length) {
    const weakest = mastery.find(m => m.accuracy != null && m.accuracy < 65);
    if (weakest) {
      root.appendChild(el("div", { class: "focus-banner" }, [
        el("span", { class: "rb-icon" }, "🎯"),
        el("div", { style: "flex:1" }, [
          el("strong", {}, `Fokus latihan: ${weakest.subject}`),
          el("div", { style: "font-size:13px" }, `Akurasimu ${weakest.accuracy}% di mata uji ini — paling perlu diperkuat.`),
        ]),
        el("button", { class: "btn sm primary", onclick: () => startPractice("subject", { subject: weakest.subject, title: "Latihan " + weakest.subject }) }, "Latih sekarang"),
      ]));
    }
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [el("h3", { style: "margin-top:0" }, "Penguasaan per Mata Uji")]);
    mastery.forEach(m => {
      const acc = m.accuracy ?? 0, tone = accTone(m.accuracy);
      card.appendChild(el("div", { class: "mastery-row" }, [
        el("div", { class: "mr-head" }, [el("strong", {}, m.subject), el("span", { class: "mr-acc " + tone }, m.accuracy == null ? "–" : m.accuracy + "%")]),
        el("div", { class: "meter" }, [el("div", { class: "meter-fill " + tone, style: `width:${acc}%` })]),
        el("div", { class: "mr-meta" }, [
          el("span", {}, `${m.correct} benar / ${m.answered} dijawab · ${m.attempts}× dikerjakan${m.avgMs ? " · ⏱ " + fmtDur(m.avgMs) + "/soal" : ""}`),
          el("span", { style: "flex:1" }),
          el("button", { class: "btn sm", onclick: () => startPractice("subject", { subject: m.subject, title: "Latihan " + m.subject }) }, "Latih →"),
        ]),
      ]));
    });
    root.appendChild(card);
  }

  // ----- Tren skor per paket -----
  store.packages.forEach(p => {
    const rec = store.records[p.id];
    if (!rec || !rec.history || !rec.history.length) return;
    const h = rec.history;
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [el("h3", { style: "margin-top:0" }, "Tren Skor — " + p.name)]);
    card.appendChild(barChart(h.map(x => x.pct), h.map(x => "Skor " + x.score)));
    const last = h[h.length - 1];
    const trend = h.length >= 2 ? last.pct - h[h.length - 2].pct : 0;
    card.appendChild(el("div", { class: "q-meta", style: "margin-top:10px" },
      `${h.length} percobaan · terbaru ${last.score} (${last.pct}%)` +
      (h.length >= 2 ? (trend >= 0 ? ` · ▲ +${trend}% dari sebelumnya` : ` · ▼ ${trend}% dari sebelumnya`) : "") +
      ` · rekor ${rec.best.score} (${rec.best.pct}%)`));
    root.appendChild(card);
  });

  root.appendChild(el("div", { class: "btn-row", style: "margin-top:4px" }, [
    el("button", { class: "btn primary", onclick: () => go("practice") }, "🏋️ Buka Latihan"),
  ]));
}

/* =========================================================================
   VIEW: LATIHAN (latihan tanpa waktu + spaced repetition)
   ========================================================================= */
function bookmarkBtn(qId) {
  const b = el("button", { class: "bookmark-btn" + (isBookmarked(qId) ? " on" : ""), title: "Tandai untuk dilatih lagi" },
    isBookmarked(qId) ? "★ Ditandai" : "☆ Tandai");
  b.addEventListener("click", () => { const on = toggleBookmark(qId); b.classList.toggle("on", on); b.textContent = on ? "★ Ditandai" : "☆ Tandai"; });
  return b;
}
function practiceCard(icon, title, sub, disabled, onstart) {
  return el("div", { class: "card pkg-card" }, [
    el("h3", { style: "margin:0 0 4px" }, title),
    el("div", { class: "pkg-meta" }, [el("span", { class: "chip yellow" }, icon + " " + sub)]),
    el("button", { class: "btn primary", style: "margin-top:auto", disabled: disabled ? "" : null, onclick: disabled ? null : onstart },
      disabled ? "Belum tersedia" : "Mulai latihan"),
  ]);
}
function renderPractice() {
  if (practiceState) return renderPracticeSession();
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Latihan Soal"));
  root.appendChild(el("p", { class: "page-sub" }, "Latihan tanpa batas waktu dengan umpan balik & pembahasan langsung. Soal dipilih cerdas (spaced repetition) — yang sering salah & belum dikuasai didahulukan."));

  if (!store.questions.length) {
    root.appendChild(emptyState("📚", "Belum ada soal", "Tambahkan soal di menu Input Soal dulu.",
      el("button", { class: "btn primary", onclick: () => go("input") }, "+ Input Soal")));
    return;
  }

  const wrongN = weakQuestionIds().length;
  const bmN = Object.keys(store.bookmarks).length;
  const grid = el("div", { class: "grid" }, [
    practiceCard("🎯", "Soal yang salah", `${wrongN} soal perlu diulang`, wrongN === 0, () => startPractice("wrong", { title: "Soal yang salah" })),
    practiceCard("★", "Soal ditandai", `${bmN} soal di-bookmark`, bmN === 0, () => startPractice("bookmark", { title: "Soal ditandai" })),
    practiceCard("🔀", "Campur cerdas", `${store.questions.length} soal · prioritas SRS`, false, () => startPractice("mix", { title: "Campur cerdas" })),
  ]);
  root.appendChild(grid);

  root.appendChild(el("h3", { style: "margin-top:22px" }, "Latihan per Mata Uji"));
  const subjects = [...new Set(store.questions.map(q => q.subject || "Lainnya"))];
  const sg = el("div", { class: "grid" });
  subjects.forEach(s => {
    const n = store.questions.filter(q => (q.subject || "Lainnya") === s).length;
    sg.appendChild(practiceCard("📚", s, `${n} soal`, n === 0, () => startPractice("subject", { subject: s, title: "Latihan " + s })));
  });
  root.appendChild(sg);
}
function startPractice(mode, opts = {}) {
  const byId = {}; store.questions.forEach(q => byId[q.id] = q);
  let ids;
  if (mode === "wrong") ids = weakQuestionIds();
  else if (mode === "bookmark") ids = Object.keys(store.bookmarks);
  else if (mode === "subject") ids = store.questions.filter(q => (q.subject || "Lainnya") === opts.subject).map(q => q.id);
  else ids = store.questions.map(q => q.id);

  let qs = ids.map(id => byId[id]).filter(Boolean);
  if (!qs.length) {
    toast(mode === "wrong" ? "Belum ada soal salah untuk diulang 🎉" : mode === "bookmark" ? "Belum ada soal yang ditandai" : "Belum ada soal");
    return;
  }
  qs = (mode === "subject" ? shuffle(qs) : qs.slice().sort((a, b) => srsPriority(b.id) - srsPriority(a.id)));
  qs = qs.slice(0, 25);
  const prepared = qs.map(q => prepareQuestion(q, true));
  practiceState = {
    mode, subject: opts.subject || null, title: opts.title || "Latihan",
    pool: prepared, idx: 0,
    answers: new Array(prepared.length).fill(null),
    revealed: new Array(prepared.length).fill(false),
    correct: 0, wrong: 0, startedAt: Date.now(), qStart: 0,
  };
  go("practice");
}
function renderPracticeSession() {
  const root = app();
  root.innerHTML = "";
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  if (!ps.qStart) ps.qStart = Date.now();
  const answeredCount = ps.revealed.filter(Boolean).length;

  root.appendChild(el("div", { class: "exam-header" }, [
    el("div", {}, [
      el("h2", { class: "page-title", style: "margin:0" }, ps.title),
      el("div", { class: "q-meta" }, `Soal ${i + 1} dari ${ps.pool.length} · ✅ ${ps.correct} · ❌ ${ps.wrong}`),
    ]),
    el("button", { class: "btn sm", onclick: () => finishPractice() }, "Akhiri"),
  ]));
  root.appendChild(el("div", { class: "meter", style: "margin-bottom:14px" }, [el("div", { class: "meter-fill good", style: `width:${Math.round((answeredCount / ps.pool.length) * 100)}%` })]));

  const revealed = ps.revealed[i], chosen = ps.answers[i];
  const card = el("div", { class: "card", id: "practiceMain" }, [
    el("div", { class: "q-meta", style: "display:flex;align-items:center;gap:8px" }, [
      q.subject ? el("span", { class: "tag" }, q.subject) : null, el("span", { style: "flex:1" }), bookmarkBtn(q.id),
    ]),
    mathText("div", "q-text", q.text),
    q.image ? el("img", { class: "q-img", src: q.image, alt: "gambar soal", onerror: function () { this.style.display = "none"; } }) : null,
  ]);
  q.order.forEach((origIdx, displayIdx) => {
    let cls = "choice";
    if (revealed) { if (origIdx === q.answer) cls += " correct"; else if (displayIdx === chosen) cls += " wrong"; }
    else if (displayIdx === chosen) cls += " selected";
    const choice = el("div", { class: cls }, [
      el("div", { class: "key" }, OPT_KEYS[displayIdx]),
      el("div", { class: "ctext", html: renderMath(q.options[origIdx]) + (revealed && origIdx === q.answer ? "  ✓ kunci" : (revealed && displayIdx === chosen ? "  ✗ jawabanmu" : "")) }),
    ]);
    if (!revealed) choice.addEventListener("click", () => answerPractice(displayIdx));
    card.appendChild(choice);
  });
  if (revealed && q.pembahasan) card.appendChild(el("div", { class: "pembahasan" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })]));

  const lastQ = i === ps.pool.length - 1;
  const row = el("div", { class: "btn-row", style: "margin-top:18px" });
  if (revealed) {
    row.appendChild(el("span", { style: "flex:1" }));
    row.appendChild(el("button", { class: "btn dark", onclick: () => lastQ ? finishPractice() : nextPractice() }, lastQ ? "Selesai →" : "Lanjut →"));
  } else {
    row.appendChild(el("div", { class: "q-meta", style: "align-self:center" }, "Pilih jawaban (atau tombol 1–5 / A–E) untuk melihat kunci & pembahasan."));
    row.appendChild(el("span", { style: "flex:1" }));
    row.appendChild(el("button", { class: "btn", onclick: () => skipPractice() }, "Lewati →"));
  }
  card.appendChild(row);
  root.appendChild(card);
}
function answerPractice(displayIdx) {
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  if (ps.revealed[i]) return;
  ps.answers[i] = displayIdx; ps.revealed[i] = true;
  const ok = q.order[displayIdx] === q.answer;
  if (ok) ps.correct++; else ps.wrong++;
  recordQStat(q.id, ok ? "correct" : "wrong", Date.now() - (ps.qStart || Date.now()));
  saveStore();
  renderPracticeSession();
}
function skipPractice() {
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  if (ps.revealed[i]) return;
  ps.revealed[i] = true;
  recordQStat(q.id, "empty", Date.now() - (ps.qStart || Date.now()));
  saveStore();
  renderPracticeSession();
}
function nextPractice() {
  practiceState.idx++; practiceState.qStart = Date.now();
  renderPracticeSession();
}
function finishPractice() {
  const ps = practiceState;
  if (!ps) { go("practice"); return; }
  store.practiceLog.push(Date.now());
  if (store.practiceLog.length > 500) store.practiceLog = store.practiceLog.slice(-500);
  saveStore();
  const summary = { title: ps.title, mode: ps.mode, subject: ps.subject, total: ps.pool.length, done: ps.revealed.filter(Boolean).length, correct: ps.correct, wrong: ps.wrong };
  practiceState = null;
  renderPracticeSummary(summary);
}
function renderPracticeSummary(s) {
  const root = app();
  root.innerHTML = "";
  const ans = s.correct + s.wrong;
  const acc = ans > 0 ? Math.round((s.correct / ans) * 100) : 0;
  root.appendChild(el("div", { class: "score-hero" }, [
    el("div", {}, "Latihan Selesai · " + s.title),
    el("div", { class: "big" }, acc + "%"),
    el("div", {}, `${s.correct} benar dari ${ans} dijawab`),
    el("div", { class: "stat-row" }, [
      el("div", {}, [el("b", { style: "color:#86efac" }, String(s.correct)), "Benar"]),
      el("div", {}, [el("b", { style: "color:#fca5a5" }, String(s.wrong)), "Salah"]),
      el("div", {}, [el("b", { style: "color:#cbd5e1" }, String(s.total - s.done)), "Dilewati"]),
    ]),
  ]));
  root.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
    el("button", { class: "btn primary", onclick: () => startPractice(s.mode, { subject: s.subject, title: s.title }) }, "🔁 Latihan lagi"),
    el("button", { class: "btn", onclick: () => go("practice") }, "Pilih latihan lain"),
    el("button", { class: "btn", onclick: () => go("stats") }, "📊 Statistik"),
  ]));
}

/* ---------- guard ---------- */
window.addEventListener("beforeunload", e => { if (examState) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- pintasan keyboard saat ujian ---------- */
document.addEventListener("keydown", e => {
  if (document.querySelector(".modal-overlay")) return;          // jangan ganggu dialog
  if (practiceState && document.getElementById("practiceMain")) { handlePracticeKey(e); return; }
  if (!examState) return;
  if (!document.getElementById("examMain")) return;              // hanya di layar ujian
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const sec = curSec();
  const i = examState.qi;
  const q = sec.questions[i];
  const key = e.key.toLowerCase();

  // Pilih jawaban: tombol 1-5 atau A-E
  let optIdx = -1;
  if (key >= "1" && key <= "5") optIdx = parseInt(key, 10) - 1;
  else { const li = ["a", "b", "c", "d", "e"].indexOf(key); if (li >= 0) optIdx = li; }
  if (optIdx >= 0 && optIdx < q.order.length) {
    e.preventDefault();
    sec.answers[i] = (sec.answers[i] === optIdx) ? null : optIdx;
    persistExam(); renderQuestion();
    return;
  }

  if (e.key === "ArrowRight" && i < sec.questions.length - 1) { e.preventDefault(); examState.qi = i + 1; renderQuestion(); }
  else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); examState.qi = i - 1; renderQuestion(); }
  else if (key === "f") { e.preventDefault(); sec.flags[i] = !sec.flags[i]; persistExam(); renderQuestion(); }
});

function handlePracticeKey(e) {
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toLowerCase();
  if (!ps.revealed[i]) {
    let optIdx = -1;
    if (key >= "1" && key <= "5") optIdx = parseInt(key, 10) - 1;
    else { const li = ["a", "b", "c", "d", "e"].indexOf(key); if (li >= 0) optIdx = li; }
    if (optIdx >= 0 && optIdx < q.order.length) { e.preventDefault(); answerPractice(optIdx); }
  } else if (e.key === "Enter" || e.key === "ArrowRight" || key === " ") {
    e.preventDefault();
    i >= ps.pool.length - 1 ? finishPractice() : nextPractice();
  }
}

/* ---------- Zoom gambar (lightbox) ---------- */
function openLightbox(src) {
  const overlay = el("div", { class: "lightbox" }, [el("img", { src }), el("div", { class: "lb-hint" }, "Klik untuk menutup")]);
  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}
document.addEventListener("click", e => {
  const img = e.target.closest && e.target.closest("img.q-img");
  if (img && img.getAttribute("src")) openLightbox(img.getAttribute("src"));
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { const lb = document.querySelector(".lightbox"); if (lb) lb.remove(); }
});

/* =========================================================================
   AKUN & SINKRONISASI ANTAR PERANGKAT
   ========================================================================= */
const TOKEN_KEY = "tryout_simak_ui_token";
const EMAIL_KEY = "tryout_simak_ui_email";
let pushTimer = null;

function authToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
function authEmail() { try { return localStorage.getItem(EMAIL_KEY); } catch (e) { return null; } }
function isLoggedIn() { return !!authToken(); }
function setAuth(token, email) {
  try { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(EMAIL_KEY, email); } catch (e) { /* abaikan */ }
  updateAccountNav();
}
function clearAuth() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EMAIL_KEY); } catch (e) { /* abaikan */ }
  updateAccountNav();
}
function updateAccountNav() {
  const btn = document.querySelector('.navbtn[data-view="account"]');
  if (btn) btn.textContent = isLoggedIn() ? "👤 Akun" : "Masuk";
}

async function api(pathName, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch("/api" + pathName, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try { data = await res.json(); } catch (e) { /* abaikan */ }
  if (!res.ok) throw new Error(data.error || ("Gagal (" + res.status + ")"));
  return data;
}

// Tulis data server ke localStorage tanpa memicu push balik (hindari loop).
function applyRemoteStore(data, updatedAt) {
  store = normalizeStore(data || {});
  store._updatedAt = updatedAt || store._updatedAt || 0;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* abaikan */ }
}

function schedulePush() {
  if (!isLoggedIn()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 1500);
}
async function pushNow() {
  if (!isLoggedIn()) return;
  try {
    await api("/data", { method: "PUT", token: authToken(), body: { data: store, updatedAt: store._updatedAt || Date.now() } });
    setSyncStatus("Tersinkron ✓ " + fmtDate(Date.now()));
  } catch (e) {
    if (/terautentikasi|valid|kedaluwarsa/i.test(e.message)) { clearAuth(); toast("Sesi berakhir, silakan masuk lagi"); }
    else setSyncStatus("Gagal sinkron: " + e.message);
  }
}

// Saat baru login / buka aplikasi: samakan data lokal dengan server (last-write-wins, dengan opsi manual).
async function syncOnLogin({ silent = false } = {}) {
  if (!isLoggedIn()) return;
  let remote;
  try { remote = await api("/data", { token: authToken() }); }
  catch (e) { if (!silent) toast("Gagal memuat data server: " + e.message); if (/terautentikasi|valid|kedaluwarsa/i.test(e.message)) clearAuth(); return; }

  const localHasData = (store.packages && store.packages.length) || Object.keys(store.records || {}).length;
  const localTs = store._updatedAt || 0;
  const remoteHasData = remote.data && typeof remote.data === "object";
  const remoteTs = remote.updatedAt || 0;

  if (!remoteHasData) { await pushNow(); if (!silent) toast("Data perangkat ini diunggah ke akunmu"); return; }
  if (!localHasData) { applyRemoteStore(remote.data, remoteTs); if (!silent) toast("Data ditarik dari akunmu"); go(currentView === "account" ? "account" : "home"); return; }

  if (remoteTs > localTs) { applyRemoteStore(remote.data, remoteTs); if (!silent) toast("Data terbaru ditarik dari server"); go(currentView === "account" ? "account" : "home"); }
  else if (localTs > remoteTs) { await pushNow(); if (!silent) toast("Data perangkat ini lebih baru — diunggah"); }
  else if (!silent) setSyncStatus("Sudah sinkron ✓");
}

function setSyncStatus(msg) { const el2 = document.getElementById("syncStatus"); if (el2) el2.textContent = msg; }

function renderAccount() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Akun & Sinkronisasi"));
  root.appendChild(el("p", { class: "page-sub" }, "Masuk untuk menyimpan soal, rekor, & statistik di server dan memakainya di semua perangkat. Tanpa login pun aplikasi tetap jalan offline."));

  if (isLoggedIn()) {
    root.appendChild(el("div", { class: "card", style: "max-width:520px" }, [
      el("div", { class: "q-meta" }, "Masuk sebagai"),
      el("h3", { style: "margin:2px 0 14px" }, authEmail() || "—"),
      el("div", { id: "syncStatus", class: "q-meta", style: "margin-bottom:14px" }, "Sinkron otomatis setiap ada perubahan."),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn primary", onclick: () => { setSyncStatus("Mengunggah…"); pushNow(); } }, "⬆️ Unggah ke server"),
        el("button", { class: "btn", onclick: () => { setSyncStatus("Menarik…"); pullOverwrite(); } }, "⬇️ Tarik dari server"),
        el("button", { class: "btn danger", onclick: () => { clearAuth(); toast("Keluar dari akun"); renderAccount(); } }, "Keluar"),
      ]),
      el("div", { class: "note", style: "margin-top:14px" }, "Sinkron otomatis memakai prinsip data terbaru menang. Pakai tombol di atas untuk memaksa arah sinkron bila perlu."),
    ]));
    return;
  }

  // Form masuk / daftar
  const emailIn = el("input", { type: "text", id: "accEmail", placeholder: "nama@email.com", autocomplete: "username" });
  const passIn = el("input", { type: "password", id: "accPass", placeholder: "Minimal 6 karakter", autocomplete: "current-password" });
  const msg = el("div", { class: "q-meta", style: "min-height:18px;color:var(--red)" }, "");
  const submit = async (mode) => {
    const email = emailIn.value.trim(), password = passIn.value;
    msg.style.color = "var(--red)"; msg.textContent = "";
    if (!email || !password) { msg.textContent = "Isi email & password."; return; }
    try {
      const out = await api(mode === "register" ? "/register" : "/login", { method: "POST", body: { email, password } });
      setAuth(out.token, out.email);
      msg.style.color = "var(--green)";
      msg.textContent = mode === "register" ? "Akun dibuat. Menyinkronkan…" : "Berhasil masuk. Menyinkronkan…";
      await syncOnLogin();
      renderAccount();
      toast("Selamat datang, " + out.email);
    } catch (e) { msg.textContent = e.message; }
  };

  root.appendChild(el("div", { class: "card", style: "max-width:460px" }, [
    field("Email", emailIn),
    field("Password", passIn),
    msg,
    el("div", { class: "btn-row", style: "margin-top:8px" }, [
      el("button", { class: "btn primary", onclick: () => submit("login") }, "Masuk"),
      el("button", { class: "btn", onclick: () => submit("register") }, "Daftar baru"),
    ]),
  ]));
}

// Tarik paksa data server, menimpa data lokal (dengan konfirmasi).
function pullOverwrite() {
  confirmModal("Tarik dari server?", "Data di perangkat ini akan diganti dengan data dari akunmu.", async () => {
    try {
      const remote = await api("/data", { token: authToken() });
      if (!remote.data) { toast("Belum ada data di server"); return; }
      applyRemoteStore(remote.data, remote.updatedAt || Date.now());
      toast("Data ditarik dari server"); go("home");
    } catch (e) { toast("Gagal: " + e.message); }
  }, "Ya, tarik");
}

/* ---------- Tema gelap/terang ---------- */
const THEME_KEY = "tryout_simak_ui_theme";
function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
function applyThemeIcon() {
  const b = document.getElementById("themeToggle");
  if (b) { const dark = currentTheme() === "dark"; b.textContent = dark ? "☀️" : "🌙"; b.title = dark ? "Beralih ke tema terang" : "Beralih ke tema gelap"; }
}
function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* abaikan */ }
  applyThemeIcon();
}
(function initTheme() {
  const b = document.getElementById("themeToggle");
  if (b) b.addEventListener("click", toggleTheme);
  applyThemeIcon();
})();

/* ---------- boot ---------- */
updateAccountNav();
if (tryRestoreExam()) {
  go("exam");
  toast("Tryout sebelumnya dilanjutkan dari posisi terakhir");
} else {
  go("home");
}
// Sinkron diam-diam saat buka aplikasi (jika sudah login & tidak sedang ujian).
if (isLoggedIn() && !examState) syncOnLogin({ silent: true });
