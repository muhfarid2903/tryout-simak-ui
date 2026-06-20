/* =========================================================================
   Tryout SIMAK UI Pascasarjana — aplikasi web (vanilla JS, akun & sinkron via API)
   Mendukung: mode waktu global / per mata uji (sesi terkunci),
              acak urutan soal & acak pilihan jawaban.
   ========================================================================= */

const STORAGE_KEY = "tryout_simak_ui_ppds_2026_v1";
const EXAM_KEY = "tryout_simak_ui_ppds_2026_exam_v1"; // progress tryout berjalan (agar tahan reload)
const OPT_KEYS = ["A", "B", "C", "D", "E"];
const SCORE = { correct: 4, wrong: -1, empty: 0 };
const PRESET_SUBJECTS = ["Kemampuan Verbal", "Kemampuan Kuantitatif", "Kemampuan Penalaran", "Bahasa Inggris"];
const DEFAULT_SECTION_MIN = 30;
const SRS_DAY = 86400000; // 1 hari dalam ms (penjadwalan spaced repetition)

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
  s.daily = s.daily || {};            // jumlah soal dijawab per hari: { "YYYY-M-D": n } (untuk target harian)
  s.dailyMs = s.dailyMs || {};        // total waktu belajar per hari (ms): untuk target harian berbasis menit
  s.qnotes = s.qnotes || {};          // catatan refleksi per soal (jurnal kesalahan): { qId: teks }
  s.settings = s.settings || {};
  if (s.settings.calibrate == null) s.settings.calibrate = true; // mode rating keyakinan
  if (s.settings.dailyGoal == null) s.settings.dailyGoal = 20;   // target soal per hari
  if (s.settings.dailyGoalType == null) s.settings.dailyGoalType = "count"; // "count" (soal) | "minutes" (menit)
  if (s.settings.dailyGoalMin == null) s.settings.dailyGoalMin = 15;        // target menit per hari
  s.calib = s.calib || { sure: { n: 0, correct: 0 }, unsure: { n: 0, correct: 0 }, guess: { n: 0, correct: 0 } };
  if (s._updatedAt == null) s._updatedAt = 0; // penanda versi untuk sinkron antar perangkat
  s.packages.forEach(p => {
    if (!p.mode) p.mode = "sections";
    if (p.durationMin == null) p.durationMin = 90;
    if (!p.sectionMinutes) p.sectionMinutes = {};
    if (p.shuffleQuestions == null) p.shuffleQuestions = true;
    if (p.shuffleOptions == null) p.shuffleOptions = true;
  });
  Object.values(s.qstats).forEach(migrateSrs); // beri jadwal SRS pada data lama
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
    if (!Array.isArray(q.optExplain)) q.optExplain = []; // penjelasan per pilihan (kenapa salah)
    if (!Array.isArray(q.steps)) q.steps = []; // pembahasan langkah-demi-langkah (opsional)
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
        optExplain: ["Tepat — konvergen = mengumpul ke satu titik.", "Ini justru makna DIVERGEN, lawan katanya.", "Sama arah dengan 'menyebar' — menjauh dari satu titik.", "Terlalu umum; tidak menangkap arti 'memusat'.", "Bercabang = memencar, kebalikan dari konvergen."],
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
// pickedOrig = indeks opsi ASLI yang dipilih (0-based) untuk analitik distraktor; null bila kosong.
function recordQStat(qId, outcome, timeMs, pickedOrig) {
  if (!qId) return;
  const st = store.qstats[qId] || { seen: 0, correct: 0, wrong: 0, empty: 0, lastResult: null, lastSeen: 0, timeMs: 0 };
  st.seen++;
  st[outcome] = (st[outcome] || 0) + 1;
  st.lastResult = outcome;
  st.lastSeen = Date.now();
  st.timeMs += timeMs || 0;
  if (pickedOrig != null && pickedOrig >= 0) { // hitung berapa kali tiap opsi dipilih (analitik distraktor)
    if (!Array.isArray(st.picks)) st.picks = [];
    st.picks[pickedOrig] = (st.picks[pickedOrig] || 0) + 1;
  }
  scheduleSrs(st, outcome);
  store.qstats[qId] = st;
  if (!store.daily) store.daily = {};
  if (!store.dailyMs) store.dailyMs = {};
  const dk = dayKey(Date.now());
  store.daily[dk] = (store.daily[dk] || 0) + 1;            // progres target harian (jumlah soal)
  store.dailyMs[dk] = (store.dailyMs[dk] || 0) + (timeMs || 0); // progres target harian (waktu)
}

// Kalibrasi keyakinan (metakognisi): cocokkan rasa yakin dengan kebenaran jawaban.
const CONF_META = { sure: { label: "Yakin", icon: "💪" }, unsure: { label: "Ragu", icon: "🤔" }, guess: { label: "Tebak", icon: "🎲" } };
function recordCalibration(conf, ok) {
  const c = store.calib && store.calib[conf];
  if (!c) return;
  c.n++; if (ok) c.correct++;
}

/* ---------- Spaced repetition: penjadwalan review nyata (gaya SM-2 ringan) ----------
   Tiap soal menyimpan jadwal: ease (faktor kemudahan), reps (benar beruntun),
   interval (hari sampai review berikutnya), due (timestamp jatuh tempo).
   Benar  → interval membesar (1 hari → 3 hari → interval × ease) → due makin jauh.
   Salah/kosong → reset, jatuh tempo lagi hari ini agar segera diulang. */
function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }
function scheduleSrs(st, outcome) {
  st.ease = st.ease || 2.5;
  st.reps = st.reps || 0;
  st.interval = st.interval || 0;
  if (outcome === "correct") {
    st.reps += 1;
    if (st.reps === 1) st.interval = 1;
    else if (st.reps === 2) st.interval = 3;
    else st.interval = Math.max(1, Math.round(st.interval * st.ease));
    st.ease = Math.min(2.8, st.ease + 0.1);
    st.due = Date.now() + st.interval * SRS_DAY;
  } else { // wrong / empty → ulangi hari ini
    st.reps = 0;
    st.interval = 0;
    st.ease = Math.max(1.3, st.ease - (outcome === "wrong" ? 0.2 : 0.15));
    st.due = Date.now();
  }
}
// Migrasi data lama (qstats tanpa jadwal) → beri due awal yang masuk akal.
function migrateSrs(st) {
  if (st.due != null) return;
  st.ease = 2.5; st.reps = 0; st.interval = 0;
  if (st.lastResult === "correct" && st.correct > st.wrong) {
    st.reps = Math.min(4, st.correct - st.wrong);
    st.interval = st.reps >= 2 ? 3 : 1;
    st.due = (st.lastSeen || Date.now()) + st.interval * SRS_DAY;
  } else {
    st.due = Date.now(); // belum dikuasai → perlu diulang sekarang
  }
}
function isDue(qId) { const st = store.qstats[qId]; return !!(st && st.due != null && st.due <= endOfToday()); }
// Soal yang sudah pernah dikerjakan & jatuh tempo untuk diulang hari ini (terurut prioritas).
function dueQuestionIds(pkgId) {
  return store.questions
    .filter(q => (!pkgId || q.packageId === pkgId) && isDue(q.id))
    .map(q => q.id)
    .sort((a, b) => srsPriority(b) - srsPriority(a));
}
// Soal yang belum pernah dikerjakan sama sekali.
function newQuestionIds(pkgId) {
  return store.questions
    .filter(q => (!pkgId || q.packageId === pkgId) && !(store.qstats[q.id] && store.qstats[q.id].seen))
    .map(q => q.id);
}
// Perkiraan jumlah soal jatuh tempo beberapa hari ke depan (untuk grafik jadwal).
// Indeks 0 = hari ini (termasuk yang sudah lewat jatuh tempo), 1 = besok, dst.
function srsForecast(days = 7) {
  const out = [];
  const today = endOfToday();
  for (let i = 0; i < days; i++) {
    const upper = today + i * SRS_DAY;
    const lower = i === 0 ? -Infinity : today + (i - 1) * SRS_DAY;
    let n = 0;
    store.questions.forEach(q => {
      const st = store.qstats[q.id];
      if (st && st.due != null && st.due > lower && st.due <= upper) n++;
    });
    out.push(n);
  }
  return out;
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
  let streak = 0, graceUsed = false;
  const cur = new Date();
  // mulai dari hari ini; jika hari ini belum ada aktivitas, izinkan mulai dari kemarin
  if (!days.has(dayKey(cur.getTime()))) cur.setDate(cur.getDate() - 1);
  // Streak "ramah": satu hari bolong dimaafkan agar pengguna sibuk tak langsung kehilangan
  // momentum. Dua hari kosong beruntun tetap memutus streak.
  while (true) {
    if (days.has(dayKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }
    else if (!graceUsed && streak > 0) {
      graceUsed = true; cur.setDate(cur.getDate() - 1); // lewati 1 hari bolong (tak dihitung)
      if (!days.has(dayKey(cur.getTime()))) break;      // dua hari kosong → streak putus
    } else break;
  }
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
// Mata uji terlemah (akurasi terendah, sudah pernah dikerjakan) untuk weakness drill.
function weakestSubjects(limit = 3) {
  return subjectMastery()
    .filter(m => m.attempts > 0 && m.accuracy != null)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map(m => m.subject);
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
  if (st.due != null) { // dahulukan yang sudah jatuh tempo, tunda yang belum
    const overdue = (Date.now() - st.due) / SRS_DAY;
    p += overdue >= 0 ? Math.min(40, 20 + overdue * 4) : Math.max(-40, overdue * 4);
  }
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
// Soal "bandel" (leech): sudah dilihat cukup sering tapi tetap lebih sering salah dan
// hasil terakhir belum benar. Latihan berulang tak produktif → arahkan baca materi.
function isLeech(qId) {
  const st = store.qstats[qId];
  if (!st || st.seen < 3) return false;
  const fails = (st.wrong || 0) + (st.empty || 0);
  return fails >= 3 && fails > (st.correct || 0) && st.lastResult !== "correct";
}
function leechQuestionIds() {
  return store.questions.filter(q => isLeech(q.id)).map(q => q.id)
    .sort((a, b) => srsPriority(b) - srsPriority(a));
}
// Interleaving (selang-seling antar mata uji): susun ulang round-robin agar soal dari
// mata uji yang sama tak menumpuk berurutan — melatih daya bedah & transfer (desirable difficulty).
// Urutan prioritas DALAM tiap mata uji tetap terjaga.
function interleaveBySubject(qs) {
  const groups = new Map();
  qs.forEach(q => { const s = q.subject || "Lainnya"; if (!groups.has(s)) groups.set(s, []); groups.get(s).push(q); });
  if (groups.size <= 1) return qs;
  const buckets = [...groups.values()];
  const out = [];
  for (let any = true; any;) {
    any = false;
    for (const b of buckets) if (b.length) { out.push(b.shift()); any = true; }
  }
  return out;
}
// Acuan waktu/soal satu mata uji (median rata-rata waktu per soal yg pernah dikerjakan).
// Dipakai untuk klasifikasi error per-soal. 0 = data referensi belum cukup.
function subjectTimeRef(subject) {
  const times = [];
  store.questions.forEach(q => {
    if ((q.subject || "Lainnya") !== subject) return;
    const st = store.qstats[q.id];
    if (st && st.seen) times.push(st.timeMs / st.seen);
  });
  if (times.length < 3) return 0;
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}
// Klasifikasi satu jawaban SALAH (metakognisi / error analysis):
// cepat & salah → kemungkinan ceroboh; selain itu → konsep belum kuat.
// Mengembalikan null bila referensi waktu belum cukup.
function errorKind(q, timeMs) {
  const med = subjectTimeRef(q.subject || "Lainnya");
  if (!med || !timeMs) return null;
  if (timeMs <= med * 0.7)
    return { icon: "⚡", label: "Cepat tapi salah — kemungkinan ceroboh", tip: "Baca soal & semua pilihan sampai tuntas sebelum mengunci jawaban." };
  return { icon: "🐢", label: "Lambat & salah — konsepnya belum kuat", tip: "Buka materi mata uji ini, lalu ulangi soal serupa." };
}
// Petunjuk kecepatan saat pembahasan: bandingkan waktu jawab dgn kebiasaan di mata uji ini.
function speedHint(q, timeMs) {
  const med = subjectTimeRef(q.subject || "Lainnya");
  if (!med || !timeMs) return null;
  const ratio = timeMs / med;
  const word = ratio >= 1.6 ? `lebih lambat dari biasanya (≈${ratio.toFixed(1)}×)`
    : ratio <= 0.6 ? "lebih cepat dari biasanya"
    : "sesuai kecepatan biasamu";
  return `⏱ ${fmtDur(timeMs)} — ${word} di ${q.subject || "Lainnya"} (rata-rata ${fmtDur(med)}/soal).`;
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

const NAV_VIEWS = ["home", "practice", "stats", "input", "bank", "materi", "achievements", "adminresults", "adminusers", "account"];
const ADMIN_VIEWS = ["input", "bank", "adminusers", "adminresults"];
let currentView = "home";
function setNav(view) {
  document.querySelectorAll(".navbtn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
}
function go(view, arg) {
  document.body.classList.remove("auth-screen"); // renderAccount akan menyalakannya lagi bila belum login
  // Wajib login: selain halaman akun, arahkan ke login bila belum masuk.
  if (!isLoggedIn() && view !== "account") { currentView = "account"; setNav(""); window.scrollTo(0, 0); renderAccount(); return; }
  // Halaman admin hanya untuk admin.
  if (ADMIN_VIEWS.includes(view) && !isAdmin()) { toast("Khusus admin"); view = "home"; }
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
  else if (view === "adminusers") renderAdminUsers();
  else if (view === "adminresults") renderAdminResults();
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

// Jumlah soal yang dijawab hari ini (latihan + ujian) untuk target harian.
function todayCount() { return (store.daily && store.daily[dayKey(Date.now())]) || 0; }
function dailyGoalValue() { return Math.max(1, store.settings.dailyGoal || 20); }
// Target harian berbasis waktu (menit) — alternatif ramah bagi pengguna sibuk.
function dailyGoalType() { return store.settings.dailyGoalType === "minutes" ? "minutes" : "count"; }
function todayMinutes() { return Math.round((((store.dailyMs && store.dailyMs[dayKey(Date.now())]) || 0)) / 60000); }
function dailyGoalMinValue() { return Math.max(1, store.settings.dailyGoalMin || 15); }

/* ---------- Pengingat review (notifikasi) ---------- */
function notifySupported() { return typeof Notification !== "undefined"; }
function notifyGranted() { return notifySupported() && Notification.permission === "granted"; }
function remindersOn() { return store.settings.remind === true && notifyGranted(); }
async function enableReminders() {
  if (!notifySupported()) { toast("Browser ini tidak mendukung notifikasi"); return; }
  let perm = Notification.permission;
  if (perm !== "granted") { try { perm = await Notification.requestPermission(); } catch (e) { perm = "denied"; } }
  if (perm !== "granted") { toast("Izin notifikasi ditolak — aktifkan lewat pengaturan browser"); return; }
  store.settings.remind = true; saveStore();
  // Best-effort: pengingat harian via periodic background sync (Chromium + PWA terpasang).
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.periodicSync) {
      const status = await navigator.permissions.query({ name: "periodic-background-sync" });
      if (status.state === "granted") await reg.periodicSync.register("review-reminder", { minInterval: 24 * 60 * 60 * 1000 });
    }
  } catch (e) { /* abaikan — pengingat tetap muncul saat aplikasi dibuka */ }
  toast("Pengingat review diaktifkan 🔔");
  renderHome();
}
function disableReminders() {
  store.settings.remind = false; saveStore();
  try { navigator.serviceWorker.ready.then(reg => reg.periodicSync && reg.periodicSync.unregister("review-reminder")).catch(() => {}); } catch (e) {}
  toast("Pengingat dimatikan");
  renderHome();
}
// Tampilkan notifikasi saat ada soal jatuh tempo (maks. sekali per hari).
function maybeRemindReviews() {
  if (!remindersOn()) return;
  const due = dueQuestionIds().length;
  if (!due) return;
  const today = dayKey(Date.now());
  if (store.settings.lastRemind === today) return;
  try {
    new Notification(`Review hari ini: ${due} soal 📅`, {
      body: "Ulang soal yang jatuh tempo agar tetap melekat. Buka Latihan → Review hari ini.",
      icon: "icon.svg", tag: "review-reminder",
    });
    store.settings.lastRemind = today; saveStore();
  } catch (e) { /* abaikan */ }
}

// Kartu target harian dengan cincin progres (SVG, tanpa CSS tambahan).
// Dua mode: berbasis jumlah soal ("count") atau waktu belajar ("minutes").
function dailyGoalCard() {
  const byMin = dailyGoalType() === "minutes";
  const goal = byMin ? dailyGoalMinValue() : dailyGoalValue();
  const done = byMin ? todayMinutes() : todayCount();
  const unit = byMin ? "menit" : "soal";
  const met = done >= goal;
  const R = 30, C = 2 * Math.PI * R, off = C * (1 - Math.min(1, done / goal));
  const color = met ? "var(--green)" : "var(--ui-yellow-dark)";
  const ring = el("div", { style: "flex:none", html:
    `<svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label="Progres target harian ${done} dari ${goal} ${unit}">
       <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--surface-mute)" stroke-width="8"/>
       <circle cx="38" cy="38" r="${R}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
         stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 38 38)"
         style="transition:stroke-dashoffset .4s ease"/>
       <text x="38" y="37" text-anchor="middle" font-size="19" font-weight="800" fill="var(--ui-ink)">${done}</text>
       <text x="38" y="52" text-anchor="middle" font-size="11" fill="var(--ui-ink-soft)">/${goal}</text>
     </svg>` });
  const editGoal = () => {
    const v = prompt(byMin ? "Target menit belajar per hari:" : "Target soal per hari:", String(goal));
    if (v == null) return;
    const n = parseInt(v, 10);
    if (!Number.isFinite(n) || n < 1) { toast("Masukkan angka minimal 1"); return; }
    if (byMin) store.settings.dailyGoalMin = n; else store.settings.dailyGoal = n;
    saveStore(); renderHome();
  };
  const toggleType = () => {
    store.settings.dailyGoalType = byMin ? "count" : "minutes";
    saveStore(); renderHome();
  };
  const remindBtn = !notifySupported() ? null
    : remindersOn()
      ? el("button", { class: "btn sm", title: "Matikan pengingat", onclick: disableReminders }, "🔔 Pengingat aktif")
      : el("button", { class: "btn sm", title: "Dapatkan notifikasi saat ada review jatuh tempo", onclick: enableReminders }, "🔕 Aktifkan pengingat");
  return el("div", { class: "focus-banner", style: "margin-bottom:14px" }, [
    ring,
    el("div", { style: "flex:1" }, [
      el("strong", {}, "Target Belajar Harian"),
      el("div", { class: "q-meta", style: "font-size:13px" }, byMin ? `⏱ ${done} dari ${goal} menit` : `📝 ${done} dari ${goal} soal`),
    ]),
    el("div", { class: "btn-row", style: "flex-direction:column;gap:6px;flex:none" }, [
      el("button", { class: "btn sm", onclick: editGoal }, "Atur target"),
      el("button", { class: "btn sm", title: "Ganti satuan target", onclick: toggleType }, byMin ? "📝 Pakai jumlah soal" : "⏱ Pakai menit"),
      remindBtn,
    ]),
  ]);
}
function renderHome() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Paket Tryout"));

  if (store.packages.length === 0) {
    root.appendChild(isAdmin()
      ? emptyState("📦", "Belum ada paket tryout", "Buat paket dan soalnya di menu Input Soal.",
          el("button", { class: "btn primary", onclick: () => go("input") }, "+ Buat Paket"))
      : emptyState("📦", "Belum ada paket tryout", "Admin belum mengunggah paket soal. Cek lagi nanti ya."));
    return;
  }

  // Target belajar harian (cincin progres).
  root.appendChild(dailyGoalCard());

  // Sesi kilat untuk pengguna sibuk: 7 soal prioritas (jatuh tempo + bandel + terlemah).
  if (store.questions.length) {
    root.appendChild(el("div", { class: "focus-banner", style: "margin-bottom:14px" }, [
      el("span", { class: "rb-icon" }, "⚡"),
      el("div", { style: "flex:1" }, [
        el("strong", {}, "Review 5 menit"),
        el("div", { style: "font-size:13px" }, "Sesi kilat: soal jatuh tempo, bandel, & terlemah — pas untuk sela waktu singkat."),
      ]),
      el("button", { class: "btn sm primary", onclick: () => startPractice("micro", { title: "Review 5 menit" }) }, "Mulai"),
    ]));
  }

  // Banner spaced repetition: soal yang jatuh tempo diulang hari ini.
  const dueIds = dueQuestionIds(), newIds = newQuestionIds();
  if (dueIds.length || newIds.length) {
    root.appendChild(el("div", { class: "focus-banner" }, [
      el("span", { class: "rb-icon" }, dueIds.length ? "📅" : "✨"),
      el("div", { style: "flex:1" }, [
        el("strong", {}, dueIds.length ? `Review hari ini: ${dueIds.length} soal` : "Tidak ada review jatuh tempo 🎉"),
      ]),
      dueIds.length
        ? el("button", { class: "btn sm primary", onclick: () => startPractice("due", { title: "Review hari ini" }) }, "Mulai review")
        : (newIds.length ? el("button", { class: "btn sm primary", onclick: () => startPractice("new", { title: "Soal baru" }) }, "Coba soal baru") : null),
    ]));
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
        isAdmin() ? el("button", { class: "btn sm", onclick: () => go("input", p.id) }, "Edit") : null,
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
  const data = existing || { subject: "", text: "", image: "", options: ["", "", "", "", ""], answer: 0, pembahasan: "", optExplain: [] };
  let correctIdx = data.answer;

  const optionRows = OPT_KEYS.map((k, i) => {
    const keyBtn = el("button", { type: "button", class: "opt-key" + (i === correctIdx ? " correct" : ""), title: "Tandai sebagai kunci jawaban" }, k);
    const input = el("input", { type: "text", placeholder: `Pilihan ${k}`, value: data.options[i] || "" });
    const noteInput = el("input", { type: "text", class: "opt-explain-input", placeholder: `Kenapa ${k} salah / catatan (opsional)`, value: (data.optExplain && data.optExplain[i]) || "" });
    keyBtn.addEventListener("click", () => {
      correctIdx = i;
      form.querySelectorAll(".opt-key").forEach((b, bi) => b.classList.toggle("correct", bi === i));
    });
    return el("div", { class: "option-row-group" }, [el("div", { class: "option-row" }, [keyBtn, input]), noteInput]);
  });

  const subjectInput = el("input", { type: "text", placeholder: "mis. Kemampuan Verbal", value: data.subject || "", list: "subjlist" });
  const textInput = el("textarea", { placeholder: "Tulis pertanyaan di sini..." }, data.text || "");
  const imgInput = el("input", { type: "text", placeholder: "URL gambar (opsional)", value: data.image || "" });
  const pembInput = el("textarea", { placeholder: "Pembahasan / penjelasan jawaban (opsional)" }, data.pembahasan || "");
  const stepsInput = el("textarea", { placeholder: "Satu langkah per baris (opsional)\nmis. Diketahui rata-rata 5 bilangan = 14\nJumlah = 5 × 14 = 70\n…" }, (Array.isArray(data.steps) ? data.steps : []).join("\n"));

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
      el("label", {}, ["Pilihan jawaban ", el("span", { class: "hint" }, "— klik huruf untuk menandai kunci jawaban; isi catatan tiap pilihan untuk umpan balik kenapa salah")]),
      ...optionRows,
    ]),
    field("Pembahasan", pembInput),
    field("Langkah penyelesaian", stepsInput, "satu langkah per baris — tampil bernomor & bisa dilipat; mendukung rumus $...$"),
    el("div", { class: "btn-row" }, [
      el("button", { class: "btn primary", onclick: () => {
        const opts = optionRows.map(r => r.querySelector(".option-row input").value.trim());
        const optExplain = optionRows.map(r => r.querySelector(".opt-explain-input").value.trim());
        const text = textInput.value.trim();
        if (!text) { toast("Pertanyaan tidak boleh kosong"); return; }
        if (opts.filter(o => o).length < 2) { toast("Isi minimal 2 pilihan jawaban"); return; }
        if (!opts[correctIdx]) { toast("Pilihan yang ditandai kunci masih kosong"); return; }
        const steps = stepsInput.value.split("\n").map(s => s.trim()).filter(Boolean);
        const payload = { subject: subjectInput.value.trim(), text, image: imgInput.value.trim(), options: opts, answer: correctIdx, pembahasan: pembInput.value.trim(), optExplain, steps };
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
  const sbBank = stepsBlock(q); if (sbBank) kids.push(sbBank);

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

// Analitik distraktor: distribusi pilihan jawaban per soal (dari qstats.picks).
// Bantu deteksi distraktor lemah (tak pernah dipilih) & opsi "menjebak" (lebih laris dari kunci).
function distractorBlock(q) {
  const st = store.qstats[q.id];
  if (!st || !Array.isArray(st.picks)) return null;
  const n = q.options.length;
  const picks = []; let total = 0;
  for (let k = 0; k < n; k++) { const c = st.picks[k] || 0; picks.push(c); total += c; }
  if (total < 3) return null; // data belum cukup untuk disimpulkan
  const keyCount = picks[q.answer] || 0;
  const rows = picks.map((c, k) => {
    const pct = Math.round((c / total) * 100), isKey = k === q.answer, tone = isKey ? "good" : "bad";
    const flags = [];
    if (isAdmin() && !isKey) {
      if (c === 0 && st.seen >= 8) flags.push("distraktor lemah");
      else if (c > keyCount) flags.push("menjebak");
    }
    return el("div", { class: "mastery-row" }, [
      el("div", { class: "mr-head" }, [
        el("strong", {}, `${OPT_KEYS[k]}${isKey ? " ✓ kunci" : ""}`),
        el("span", { class: "mr-acc " + tone }, `${pct}% (${c})`),
      ]),
      el("div", { class: "meter" }, [el("div", { class: "meter-fill " + tone, style: `width:${pct}%` })]),
      flags.length ? el("div", { class: "mr-meta" }, [el("span", { class: "chip yellow" }, "⚠️ " + flags.join(", "))]) : null,
    ]);
  });
  return el("details", { class: "bank-materi" }, [
    el("summary", {}, `📊 Distribusi jawaban (${total}×)`),
    el("div", { class: "bank-materi-body" }, rows),
  ]);
}
function renderBank() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Bank Soal"));
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
        distractorBlock(q),
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

// Satu butir accordion (judul + isi yang dibangun lewat callback). Tertutup secara default.
function materiAcc(title, build) {
  const sum = el("summary", { class: "materi-acc-head" }, [el("span", { class: "materi-acc-title" }, title)]);
  const body = el("div", { class: "materi-acc-body" });
  build(body);
  return el("details", { class: "materi-acc" }, [sum, body]);
}

// Konten satu mata uji: intro + accordion pengetahuan dasar + accordion topik soal.
function materiContent(subject, count) {
  const m = MATERI[subject];
  const wrap = el("div", { class: "card materi-content" });
  wrap.appendChild(el("div", { class: "materi-content-head" }, [
    el("span", { class: "materi-ic" }, m ? m.icon : "📘"),
    el("div", { class: "materi-content-title" }, [
      el("h3", {}, subject),
      count != null ? el("span", { class: "chip yellow" }, `${count} soal`) : null,
    ]),
  ]));

  if (!m) {
    wrap.appendChild(el("p", { class: "materi-intro" },
      "Belum ada materi bawaan untuk jenis soal ini. Pelajari pola soalnya langsung di Bank Soal beserta kunci & pembahasan."));
    if (count != null && count > 0 && isAdmin())
      wrap.appendChild(el("button", { class: "btn sm", style: "margin-top:8px", onclick: () => go("bank") }, "Lihat soal di Bank Soal →"));
    return wrap;
  }

  wrap.appendChild(el("p", { class: "materi-intro" }, m.intro));

  if (m.guide && m.guide.length) {
    wrap.appendChild(el("div", { class: "materi-section-label" }, "📚 Pengetahuan Dasar & Cara Belajar"));
    m.guide.forEach(g => wrap.appendChild(materiAcc(g.h, body => {
      if (g.body) body.appendChild(el("p", { class: "materi-guide-body" }, g.body));
      if (g.points) body.appendChild(el("ul", { class: "materi-list" }, g.points.map(p => el("li", {}, p))));
      if (g.example) body.appendChild(el("div", { class: "materi-example" }, [el("strong", {}, "Contoh: "), g.example]));
    })));
  }

  wrap.appendChild(el("div", { class: "materi-section-label" }, "🎯 Topik Soal & Strategi"));
  m.topics.forEach(t => wrap.appendChild(materiAcc(t.h, body => {
    body.appendChild(el("ul", { class: "materi-list" }, t.points.map(p => el("li", {}, p))));
    if (t.example) body.appendChild(el("div", { class: "materi-example" }, [el("strong", {}, "Contoh soal: "), t.example]));
  })));

  if (count != null && count > 0 && isAdmin()) {
    wrap.appendChild(el("div", { class: "btn-row", style: "margin-top:16px" }, [
      el("button", { class: "btn sm", onclick: () => go("bank") }, "Lihat soal di Bank Soal →"),
    ]));
  }
  return wrap;
}

let materiSubject = null; // mata uji yang sedang dibuka di tab Materi

function renderMateri() {
  const root = app();
  root.innerHTML = "";
  document.body.classList.remove("auth-screen");
  root.appendChild(el("h2", { class: "page-title" }, "Materi"));

  const counts = subjectCounts();
  const subjects = Object.keys(counts);

  // Daftar mata uji yang ditampilkan beserta jumlah soalnya.
  let list;
  if (subjects.length === 0) {
    root.appendChild(el("div", { class: "note", style: "margin-bottom:16px" },
      "Bank soal masih kosong. Berikut materi umum jenis soal standar SIMAK UI."));
    list = Object.keys(MATERI).map(s => ({ subject: s, count: null }));
  } else {
    const ordered = [
      ...Object.keys(MATERI).filter(s => subjects.includes(s)),
      ...subjects.filter(s => !MATERI[s]),
    ];
    list = ordered.map(s => ({ subject: s, count: counts[s] }));
  }
  if (!list.length) return;

  // Pertahankan pilihan jika masih tersedia; jika tidak, ambil yang pertama.
  if (!list.some(x => x.subject === materiSubject)) materiSubject = list[0].subject;

  // Tab pemilih mata uji.
  root.appendChild(el("div", { class: "materi-tabs" }, list.map(x => {
    const m = MATERI[x.subject];
    return el("button", {
      class: "materi-tab" + (x.subject === materiSubject ? " active" : ""),
      onclick: () => { materiSubject = x.subject; renderMateri(); window.scrollTo(0, 0); },
    }, [el("span", { class: "mt-ic" }, m ? m.icon : "📘"), el("span", {}, x.subject)]);
  })));

  // Konten mata uji aktif.
  const active = list.find(x => x.subject === materiSubject);
  root.appendChild(materiContent(active.subject, active.count));
}

/* =========================================================================
   VIEW: PENCAPAIAN (Achievements & Rekor)
   ========================================================================= */
function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch (e) { return ""; }
}

let statsTab = "stats"; // tab aktif di halaman Statistik: "stats" | "achievements"
// Re-render Pencapaian di konteks yang tepat (tab Statistik atau halaman tersendiri).
function rerenderAchievements() { if (statsTab === "achievements") renderStats(); else renderAchievements(); }
function renderAchievements() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Pencapaian"));
  achievementsBody(root);
}
// Isi Pencapaian (badge + rekor) — bisa ditanam di tab Statistik atau halaman sendiri.
function achievementsBody(root) {
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
              saveStore(); toast("Rekor paket dihapus"); rerenderAchievements();
            }, "Ya, hapus") }, "Hapus")),
      ]));
    });
    card.appendChild(table);
    root.appendChild(card);

    root.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
      el("button", { class: "btn sm danger", onclick: () => confirmModal("Reset rekor & pencapaian?",
        "Semua rekor skor, riwayat, dan badge yang terbuka akan dihapus permanen. Soal & paket tidak terpengaruh.", () => {
          store.records = {}; store.achievements = {};
          saveStore(); toast("Rekor & pencapaian direset"); rerenderAchievements();
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
// Pembahasan langkah-demi-langkah (opsional): daftar bernomor yang bisa dilipat.
function stepsBlock(q, open) {
  const steps = Array.isArray(q.steps) ? q.steps.filter(s => String(s || "").trim()) : [];
  if (!steps.length) return null;
  const det = el("details", Object.assign({ class: "steps-block" }, open ? { open: "" } : {}));
  det.appendChild(el("summary", {}, `🪜 Langkah penyelesaian (${steps.length})`));
  const ol = el("ol", { class: "steps-list" });
  steps.forEach(s => ol.appendChild(el("li", { html: renderMath(s) })));
  det.appendChild(ol);
  return det;
}
// Umpan balik per-distraktor: penjelasan kenapa sebuah pilihan benar/salah (jika ada).
function optNoteEl(q, origIdx, isCorrect) {
  const note = q.optExplain && q.optExplain[origIdx];
  if (!note || !String(note).trim()) return null;
  return el("div", { class: "opt-note " + (isCorrect ? "correct" : "wrong"), html: renderMath(note) });
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
      recordQStat(q.id, outcome, t, d === null ? null : q.order[d]);
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
        const note = optNoteEl(q, origIdx, isCorrect); if (note) card.appendChild(note);
      });
      if (q.pembahasan) card.appendChild(el("div", { class: "pembahasan" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })]));
      const sbRes = stepsBlock(q); if (sbRes) card.appendChild(sbRes);
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
// Jurnal Kesalahan (#2): kumpulan soal yang pernah salah / "bandel" untuk dibaca ulang,
// lengkap kunci + pembahasan + catatan refleksi pribadi (elaborative interrogation).
function journalBody(root) {
  const byId = {}; store.questions.forEach(q => byId[q.id] = q);
  const ids = [...new Set([...weakQuestionIds(), ...leechQuestionIds()])]
    .filter(id => byId[id])
    .sort((a, b) => srsPriority(b) - srsPriority(a));
  if (!ids.length) {
    root.appendChild(emptyState("📓", "Belum ada catatan kesalahan",
      "Setiap soal yang kamu jawab salah akan muncul di sini untuk dibaca ulang. Mantap kalau masih kosong! 🎉",
      el("button", { class: "btn primary", onclick: () => go("practice") }, "Mulai latihan")));
    return;
  }
  root.appendChild(el("div", { class: "focus-banner", style: "margin-bottom:14px" }, [
    el("span", { class: "rb-icon" }, "📓"),
    el("div", { style: "flex:1" }, [
      el("strong", {}, `${ids.length} soal untuk ditinjau`),
      el("div", { style: "font-size:13px" }, "Baca ulang, tulis kenapa kamu salah, lalu latih lagi. Menjelaskan ke diri sendiri membuat ingatan lebih melekat."),
    ]),
    el("button", { class: "btn sm primary", onclick: () => startPractice("wrong", { title: "Soal yang salah" }) }, "Latih semua"),
  ]));
  const list = el("div");
  ids.slice(0, 50).forEach(id => {
    const q = byId[id], st = store.qstats[id] || {};
    const card = el("div", { class: "card", style: "margin-bottom:14px" }, [
      el("div", { class: "q-meta", style: "display:flex;align-items:center;gap:8px;flex-wrap:wrap" }, [
        q.subject ? el("span", { class: "tag" }, q.subject) : null,
        isLeech(id) ? el("span", { class: "chip yellow" }, "🧯 Sering salah") : null,
        el("span", {}, `❌ ${st.wrong || 0}× · ✅ ${st.correct || 0}×`),
      ]),
      mathText("div", "q-text", q.text),
      el("div", { class: "pembahasan" }, [el("strong", {}, "Kunci: "), el("span", { html: renderMath(q.options[q.answer]) })]),
    ]);
    if (q.pembahasan) card.appendChild(el("div", { class: "pembahasan" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })]));
    const ta = el("textarea", { rows: "2", placeholder: "Catatan: kenapa aku salah? (mis. salah baca soal, lupa rumus…)", style: "margin-top:10px;width:100%" }, store.qnotes[id] || "");
    ta.addEventListener("change", () => {
      const v = ta.value.trim();
      if (v) store.qnotes[id] = v; else delete store.qnotes[id];
      saveStore(); toast("Catatan disimpan");
    });
    card.appendChild(ta);
    list.appendChild(card);
  });
  root.appendChild(list);
}
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
// Grafik jumlah soal (bukan persen) — dipakai untuk jadwal review SRS.
function countChart(counts, labels) {
  const max = Math.max(1, ...counts);
  const wrap = el("div", { class: "bar-chart" });
  counts.forEach((n, i) => {
    const h = n === 0 ? 2 : Math.max(8, Math.round((n / max) * 100));
    wrap.appendChild(el("div", { class: "bar-col", title: labels[i] + " · " + n + " soal" }, [
      el("div", { class: "bar-val" }, String(n)),
      el("div", { class: "bar" }, [el("div", { class: "bar-fill " + (i === 0 && n > 0 ? "mid" : "good"), style: `height:${h}%` })]),
      el("div", { class: "bar-x" }, labels[i]),
    ]));
  });
  return wrap;
}
// Semua riwayat ujian (lintas paket), terurut waktu — untuk prediksi skor.
function examHistoryAll() {
  const all = [];
  Object.values(store.records).forEach(rec => (rec.history || []).forEach(h => all.push(h)));
  return all.sort((a, b) => a.date - b.date);
}
// Prediksi persentase skor dari riwayat tryout penuh (rata-rata berbobot terbaru + tren).
// pct di riwayat sudah memperhitungkan penalti tebakan (benar +4, salah -1) → mirip metrik SIMAK.
function predictScoreFromExams() {
  const hist = examHistoryAll();
  if (hist.length < 1) return null;
  const recent = hist.slice(-6);
  let wsum = 0, vsum = 0;
  recent.forEach((h, i) => { const w = Math.pow(1.5, i); wsum += w; vsum += w * h.pct; }); // terbaru paling berat
  let pred = vsum / wsum;
  if (hist.length >= 4) { // koreksi tren: 3 terbaru vs 3 sebelumnya (dibatasi ±5)
    const last3 = hist.slice(-3).reduce((a, h) => a + h.pct, 0) / 3;
    const prev = hist.slice(Math.max(0, hist.length - 6), hist.length - 3);
    if (prev.length) { const pAvg = prev.reduce((a, h) => a + h.pct, 0) / prev.length; pred += Math.max(-5, Math.min(5, (last3 - pAvg) * 0.5)); }
  }
  pred = Math.max(0, Math.min(100, Math.round(pred)));
  const mean = recent.reduce((a, h) => a + h.pct, 0) / recent.length;
  const sd = Math.sqrt(recent.reduce((a, h) => a + (h.pct - mean) ** 2, 0) / recent.length);
  const margin = Math.round(Math.max(4, sd) + (recent.length < 3 ? 6 : recent.length < 5 ? 3 : 0));
  return { pred, lo: Math.max(0, pred - margin), hi: Math.min(100, pred + margin), n: hist.length, margin, source: "exam" };
}
// Estimasi skor dari latihan (qstats) — dipakai saat tryout penuh masih sedikit.
// Akurasi p dipetakan ke skala skor SIMAK: per soal benar +4 / salah -1 (asumsi semua dijawab),
// sehingga pct = (4p - (1-p)) / 4 = (5p - 1)/4 → dipersen. Margin lebih lebar (bukan kondisi ujian).
function predictScoreFromPractice() {
  let correct = 0, answered = 0;
  Object.values(store.qstats).forEach(s => { correct += s.correct || 0; answered += (s.correct || 0) + (s.wrong || 0); });
  if (answered < 20) return null; // butuh cukup data agar tidak menyesatkan
  const p = correct / answered;
  const pred = Math.max(0, Math.min(100, Math.round(125 * p - 25)));
  const margin = answered < 50 ? 12 : answered < 120 ? 9 : 7;
  return { pred, lo: Math.max(0, pred - margin), hi: Math.min(100, pred + margin), n: answered, margin, source: "practice" };
}
// Prediksi gabungan: utamakan tryout penuh (paling sahih); jatuh ke estimasi latihan bila kurang.
function predictScore() {
  const exams = examHistoryAll();
  const fromEx = predictScoreFromExams();
  const fromPr = predictScoreFromPractice();
  if (exams.length >= 2) return fromEx;                 // tryout penuh cukup
  if (exams.length === 1 && fromPr) {                   // 1 tryout → gabung dgn estimasi latihan
    const pred = Math.round((fromEx.pred + fromPr.pred) / 2);
    const margin = Math.max(fromEx.margin, fromPr.margin);
    return { pred, lo: Math.max(0, pred - margin), hi: Math.min(100, pred + margin), n: fromPr.n, margin, source: "blend" };
  }
  if (fromPr) return fromPr;                             // belum tryout penuh → estimasi latihan
  return fromEx;                                         // null bila benar-benar belum ada data
}
function readinessBand(pct) {
  if (pct >= 75) return { label: "Siap tempur", icon: "🚀", tone: "good" };
  if (pct >= 60) return { label: "Hampir siap", icon: "💪", tone: "good" };
  if (pct >= 45) return { label: "Berkembang", icon: "📈", tone: "mid" };
  return { label: "Tahap awal", icon: "🌱", tone: "bad" };
}
// Rekomendasi fokus: mata uji terlemah + estimasi kenaikan skor bila diangkat ke 80%.
function focusRecommendation() {
  const m = subjectMastery().filter(x => x.answered >= 3 && x.accuracy != null);
  if (!m.length) return null;
  const totalQ = m.reduce((a, x) => a + (x.qCount || x.answered), 0) || 1;
  const weakest = m.slice().sort((a, b) => a.accuracy - b.accuracy)[0];
  if (weakest.accuracy >= 80) return null;
  const share = (weakest.qCount || weakest.answered) / totalQ;
  const gain = Math.round(share * (80 - weakest.accuracy)); // perkiraan poin % naik
  return { subject: weakest.subject, accuracy: weakest.accuracy, gain };
}
function renderStats() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Statistik Belajar"));

  // Tab: Statistik | Jurnal Kesalahan | Pencapaian (dilebur ke sini agar sidebar ramping).
  root.appendChild(el("div", { class: "materi-tabs" }, [
    el("button", { class: "materi-tab" + (statsTab === "stats" ? " active" : ""), onclick: () => { statsTab = "stats"; renderStats(); window.scrollTo(0, 0); } }, [el("span", { class: "mt-ic" }, "📊"), el("span", {}, "Statistik")]),
    el("button", { class: "materi-tab" + (statsTab === "journal" ? " active" : ""), onclick: () => { statsTab = "journal"; renderStats(); window.scrollTo(0, 0); } }, [el("span", { class: "mt-ic" }, "📓"), el("span", {}, "Jurnal Kesalahan")]),
    el("button", { class: "materi-tab" + (statsTab === "achievements" ? " active" : ""), onclick: () => { statsTab = "achievements"; renderStats(); window.scrollTo(0, 0); } }, [el("span", { class: "mt-ic" }, "🏆"), el("span", {}, "Pencapaian")]),
  ]));
  if (statsTab === "achievements") { achievementsBody(root); return; }
  if (statsTab === "journal") { journalBody(root); return; }

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

  const dueNow = dueQuestionIds().length;
  root.appendChild(el("div", { class: "stat-cards" }, [
    statCard("🔥", streak, "hari beruntun"),
    statCard("📅", dueNow, "review hari ini"),
    statCard("🎯", overallAcc == null ? "–" : overallAcc + "%", "akurasi keseluruhan"),
    statCard("📚", sumSeen, "soal dikerjakan"),
  ]));

  // ----- Prediksi skor & rekomendasi fokus -----
  const pred = predictScore();
  if (pred) {
    const band = readinessBand(pred.pred), foc = focusRecommendation();
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [
      el("h3", { style: "margin-top:0" }, "Prediksi Skor Ujian"),
      el("div", { style: "display:flex;align-items:baseline;gap:10px;flex-wrap:wrap" }, [
        el("span", { class: "mr-acc " + band.tone, style: "font-size:34px" }, pred.pred + "%"),
        el("span", { class: "q-meta" }, `kisaran ${pred.lo}–${pred.hi}%`),
        el("span", { class: "chip " + (band.tone === "good" ? "" : "yellow"), style: "margin-left:auto" }, `${band.icon} ${band.label}`),
      ]),
      el("div", { class: "meter", style: "margin:10px 0" }, [el("div", { class: "meter-fill " + band.tone, style: `width:${pred.pred}%` })]),
      el("p", { class: "q-meta", style: "margin:0" },
        pred.source === "practice"
          ? `Estimasi awal dari ${pred.n} jawaban latihan (dipetakan ke skala penalti +4/−1). Kerjakan tryout penuh untuk prediksi yang lebih akurat — ini estimasi internal, bukan skor resmi SIMAK.`
          : pred.source === "blend"
            ? `Gabungan 1 tryout penuh + ${pred.n} jawaban latihan. Tambah tryout penuh agar makin akurat — estimasi internal, bukan skor resmi SIMAK.`
            : `Estimasi dari ${pred.n} ujian terakhir (terbaru paling berpengaruh). Skor sudah memperhitungkan penalti tebakan — ini estimasi internal, bukan skor resmi SIMAK.`),
    ]);
    if (foc && foc.gain >= 1) {
      card.appendChild(el("div", { class: "focus-banner", style: "margin:12px 0 0" }, [
        el("span", { class: "rb-icon" }, "🎯"),
        el("div", { style: "flex:1" }, [
          el("strong", {}, `Ungkit terbesar: ${foc.subject}`),
          el("div", { style: "font-size:13px" }, `Akurasi ${foc.accuracy}% · +${foc.gain} poin`),
        ]),
        el("button", { class: "btn sm primary", onclick: () => startPractice("subject", { subject: foc.subject, title: "Latihan " + foc.subject }) }, "Latih"),
      ]));
    }
    root.appendChild(card);
  }

  // ----- Jadwal review (spaced repetition) -----
  if (sumSeen > 0) {
    const forecast = srsForecast(7);
    const labels = ["Hari ini", "Besok", "+2h", "+3h", "+4h", "+5h", "+6h"];
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [
      el("h3", { style: "margin-top:0" }, "Jadwal Review (Spaced Repetition)"),
      countChart(forecast, labels),
    ]);
    if (dueNow) card.appendChild(el("div", { class: "btn-row", style: "margin-top:12px" }, [
      el("button", { class: "btn sm primary", onclick: () => startPractice("due", { title: "Review hari ini" }) }, `Mulai review ${dueNow} soal`),
    ]));
    root.appendChild(card);
  }

  // ----- Kalibrasi keyakinan (metakognisi) -----
  const cal = store.calib, totalCal = cal.sure.n + cal.unsure.n + cal.guess.n;
  if (totalCal >= 5) {
    const accOf = c => c.n ? Math.round((c.correct / c.n) * 100) : null;
    const sureAcc = accOf(cal.sure), guessAcc = accOf(cal.guess);
    let insight = "Kalibrasimu cukup baik — tingkat keyakinan sejalan dengan hasil. Pertahankan!";
    if (sureAcc != null && cal.sure.n >= 5 && sureAcc < 80)
      insight = `Kamu cenderung terlalu percaya diri: saat merasa "Yakin" kamu benar ${sureAcc}%. Biasakan cek ulang sebelum mengunci jawaban.`;
    else if (guessAcc != null && cal.guess.n >= 5 && guessAcc >= 60)
      insight = `Tebakanmu sering tepat (${guessAcc}%) — intuisimu bagus. Perkuat dasarnya agar berubah jadi "Yakin".`;
    // Headline overconfidence: seberapa sering "Yakin" ternyata salah (gap = 100 − akurasi-Yakin).
    const overconf = (sureAcc != null && cal.sure.n >= 5) ? 100 - sureAcc : null;
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [
      el("div", { style: "display:flex;align-items:baseline;gap:10px;flex-wrap:wrap" }, [
        el("h3", { style: "margin:0" }, "Kalibrasi Keyakinan"),
        overconf != null ? el("span", { class: "chip " + (overconf <= 20 ? "" : "yellow"), style: "margin-left:auto", title: "Seberapa sering jawaban yang kamu rasa 'Yakin' ternyata salah." }, `🧭 Overconfidence ${overconf}%`) : null,
      ]),
    ]);
    [["sure", "💪 Yakin"], ["unsure", "🤔 Ragu"], ["guess", "🎲 Tebak"]].forEach(([k, lbl]) => {
      const c = cal[k], a = accOf(c), tone = accTone(a);
      card.appendChild(el("div", { class: "mastery-row" }, [
        el("div", { class: "mr-head" }, [el("strong", {}, lbl), el("span", { class: "mr-acc " + tone }, a == null ? "–" : a + "%")]),
        el("div", { class: "meter" }, [el("div", { class: "meter-fill " + tone, style: `width:${a || 0}%` })]),
        el("div", { class: "mr-meta" }, [el("span", {}, `${c.correct} benar / ${c.n} jawaban`)]),
      ]));
    });
    card.appendChild(el("div", { class: "focus-banner", style: "margin-top:12px" }, [el("span", { class: "rb-icon" }, "🧭"), el("div", { style: "flex:1;font-size:13px" }, insight)]));
    root.appendChild(card);
  }

  // ----- Penguasaan per mata uji (terlemah di atas) -----
  const mastery = subjectMastery().filter(m => m.attempts > 0).sort((a, b) => (a.accuracy ?? 999) - (b.accuracy ?? 999));
  if (mastery.length) {
    const weakest = mastery.find(m => m.accuracy != null && m.accuracy < 65);
    if (weakest) {
      root.appendChild(el("div", { class: "focus-banner" }, [
        el("span", { class: "rb-icon" }, "🎯"),
        el("div", { style: "flex:1" }, [
          el("strong", {}, `Fokus latihan: ${weakest.subject}`),
          el("div", { style: "font-size:13px" }, `Akurasi ${weakest.accuracy}%`),
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

  // ----- Kecepatan vs Akurasi (manajemen waktu) -----
  const sa = subjectMastery().filter(m => m.answered > 0 && m.avgMs > 0);
  if (sa.length >= 2) {
    const times = sa.map(m => m.avgMs).slice().sort((a, b) => a - b);
    const medMs = times[Math.floor(times.length / 2)];
    const ACC = 70;
    const quad = m => {
      const fast = m.avgMs <= medMs, acc = m.accuracy != null && m.accuracy >= ACC;
      if (acc && fast) return { label: "Dikuasai & cepat", icon: "✅", tone: "good", tip: "Pertahankan — ini kekuatanmu." };
      if (acc && !fast) return { label: "Teliti tapi lambat", icon: "⏳", tone: "mid", tip: "Latih kecepatan: batasi waktu per soal saat drill." };
      if (!acc && fast) return { label: "Cepat tapi ceroboh", icon: "⚡", tone: "bad", tip: "Pelan sedikit & baca soal sampai tuntas sebelum menjawab." };
      return { label: "Perlu perkuat konsep", icon: "📖", tone: "bad", tip: "Buka Materi mata uji ini, lalu latih ulang." };
    };
    const card = el("div", { class: "card", style: "margin-bottom:18px" }, [
      el("h3", { style: "margin-top:0" }, "Kecepatan vs Akurasi"),
    ]);
    sa.slice().sort((a, b) => (a.accuracy ?? 999) - (b.accuracy ?? 999)).forEach(m => {
      const Q = quad(m);
      card.appendChild(el("div", { class: "mastery-row" }, [
        el("div", { class: "mr-head" }, [
          el("strong", {}, m.subject),
          el("span", { class: "mr-acc " + Q.tone }, `${Q.icon} ${Q.label}`),
        ]),
        el("div", { class: "mr-meta" }, [
          el("span", {}, `🎯 ${m.accuracy}% · ⏱ ${fmtDur(m.avgMs)}/soal`),
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

  if (!store.questions.length) {
    root.appendChild(emptyState("📚", "Belum ada soal", "Tambahkan soal di menu Input Soal dulu.",
      el("button", { class: "btn primary", onclick: () => go("input") }, "+ Input Soal")));
    return;
  }

  const cb = el("input", { type: "checkbox" });
  cb.checked = store.settings.calibrate !== false;
  cb.addEventListener("change", () => { store.settings.calibrate = cb.checked; saveStore(); });
  root.appendChild(el("label", { style: "display:flex;align-items:center;gap:8px;cursor:pointer;margin:-4px 0 14px;font-size:14px" }, [
    cb, el("span", {}, "🧭 Mode kalibrasi keyakinan (Yakin/Ragu/Tebak)"),
  ]));

  const weakSubs = weakestSubjects(3);
  if (weakSubs.length) {
    root.appendChild(el("div", { class: "focus-banner", style: "margin-bottom:16px" }, [
      el("span", { class: "rb-icon" }, "🩹"),
      el("div", { style: "flex:1" }, [
        el("strong", {}, "Latih kelemahanku"),
        el("div", { style: "font-size:13px" }, weakSubs.join(", ")),
      ]),
      el("button", { class: "btn sm primary", onclick: () => startPractice("weakness", { title: "Latih kelemahanku" }) }, "Mulai"),
    ]));
  }

  const wrongN = weakQuestionIds().length;
  const bmN = Object.keys(store.bookmarks).length;
  const dueN = dueQuestionIds().length;
  const newN = newQuestionIds().length;
  const leechN = leechQuestionIds().length;
  const grid = el("div", { class: "grid" }, [
    practiceCard("⚡", "Review 5 menit", "sesi kilat · 7 soal prioritas", false, () => startPractice("micro", { title: "Review 5 menit" })),
    practiceCard("📅", "Review hari ini", dueN ? `${dueN} soal jatuh tempo` : "tidak ada yang jatuh tempo", dueN === 0, () => startPractice("due", { title: "Review hari ini" })),
    practiceCard("🎯", "Soal yang salah", `${wrongN} soal perlu diulang`, wrongN === 0, () => startPractice("wrong", { title: "Soal yang salah" })),
    leechN ? practiceCard("🧯", "Soal bandel", `${leechN} soal sering salah · baca materi`, false, () => startPractice("leech", { title: "Soal bandel" })) : null,
    practiceCard("★", "Soal ditandai", `${bmN} soal di-bookmark`, bmN === 0, () => startPractice("bookmark", { title: "Soal ditandai" })),
    practiceCard("🔀", "Campur cerdas", `${store.questions.length} soal · prioritas SRS`, false, () => startPractice("mix", { title: "Campur cerdas" })),
    practiceCard("✨", "Soal baru", newN ? `${newN} soal belum dicoba` : "semua sudah dicoba", newN === 0, () => startPractice("new", { title: "Soal baru" })),
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
  else if (mode === "due") ids = dueQuestionIds();
  else if (mode === "new") ids = newQuestionIds();
  else if (mode === "leech") ids = leechQuestionIds();
  else if (mode === "micro") {
    // Sesi kilat: gabungan jatuh tempo + bandel + terlemah; bila kurang, lengkapi soal baru.
    const set = new Set([...dueQuestionIds(), ...leechQuestionIds(), ...weakQuestionIds()]);
    if (set.size < 7) for (const id of newQuestionIds()) { set.add(id); if (set.size >= 7) break; }
    ids = [...set];
  }
  else if (mode === "subject") ids = store.questions.filter(q => (q.subject || "Lainnya") === opts.subject).map(q => q.id);
  else if (mode === "weakness") { const subs = new Set(weakestSubjects(3)); ids = store.questions.filter(q => subs.has(q.subject || "Lainnya")).map(q => q.id); }
  else ids = store.questions.map(q => q.id);

  let qs = ids.map(id => byId[id]).filter(Boolean);
  if (!qs.length) {
    toast(mode === "wrong" ? "Belum ada soal salah untuk diulang 🎉"
      : mode === "bookmark" ? "Belum ada soal yang ditandai"
      : mode === "due" ? "Tidak ada soal jatuh tempo hari ini 🎉"
      : mode === "new" ? "Semua soal sudah pernah kamu coba 👍"
      : mode === "leech" ? "Tidak ada soal bandel — kerja bagus! 🎉"
      : mode === "micro" ? "Belum ada soal untuk direview. Coba kerjakan beberapa soal dulu 👍"
      : mode === "weakness" ? "Kerjakan beberapa soal dulu — kelemahanmu akan terdeteksi otomatis 👍"
      : "Belum ada soal");
    return;
  }
  if (mode === "subject" || mode === "new") qs = shuffle(qs);
  else qs = interleaveBySubject(qs.slice().sort((a, b) => srsPriority(b.id) - srsPriority(a.id))); // prioritas SRS + selang-seling mata uji
  qs = qs.slice(0, mode === "micro" ? 7 : 25);
  const prepared = qs.map(q => prepareQuestion(q, true));
  practiceState = {
    mode, subject: opts.subject || null, title: opts.title || "Latihan",
    pool: prepared, idx: 0,
    answers: new Array(prepared.length).fill(null),
    revealed: new Array(prepared.length).fill(false),
    correct: 0, wrong: 0, startedAt: Date.now(), qStart: 0,
    calibrate: store.settings.calibrate !== false,
    pending: new Array(prepared.length).fill(null),
    confidence: new Array(prepared.length).fill(null),
    times: new Array(prepared.length).fill(0),
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

  const revealed = ps.revealed[i], chosen = ps.answers[i], pending = ps.pending[i];
  const card = el("div", { class: "card", id: "practiceMain" }, [
    el("div", { class: "q-meta", style: "display:flex;align-items:center;gap:8px;flex-wrap:wrap" }, [
      q.subject ? el("span", { class: "tag" }, q.subject) : null,
      isLeech(q.id) ? el("span", { class: "chip yellow", title: "Soal ini sering kamu jawab salah — baca materinya, jangan cuma diulang." }, "🧯 Sering salah") : null,
      el("span", { style: "flex:1" }), bookmarkBtn(q.id),
    ]),
    mathText("div", "q-text", q.text),
    q.image ? el("img", { class: "q-img", src: q.image, alt: "gambar soal", onerror: function () { this.style.display = "none"; } }) : null,
  ]);
  q.order.forEach((origIdx, displayIdx) => {
    let cls = "choice";
    if (revealed) { if (origIdx === q.answer) cls += " correct"; else if (displayIdx === chosen) cls += " wrong"; }
    else if (displayIdx === (ps.calibrate ? pending : chosen)) cls += " selected";
    const choice = el("div", { class: cls }, [
      el("div", { class: "key" }, OPT_KEYS[displayIdx]),
      el("div", { class: "ctext", html: renderMath(q.options[origIdx]) + (revealed && origIdx === q.answer ? "  ✓ kunci" : (revealed && displayIdx === chosen ? "  ✗ jawabanmu" : "")) }),
    ]);
    if (!revealed) choice.addEventListener("click", () => answerPractice(displayIdx));
    card.appendChild(choice);
    if (revealed) { const note = optNoteEl(q, origIdx, origIdx === q.answer); if (note) card.appendChild(note); }
  });
  if (revealed && ps.confidence[i]) {
    const ok = q.order[chosen] === q.answer, cm = CONF_META[ps.confidence[i]];
    card.appendChild(el("div", { class: "q-meta", style: "margin-top:12px;padding:8px 12px;border-radius:8px;background:var(--surface-soft)" },
      `${cm.icon} Kamu merasa ${cm.label} — ${ok ? "dan benar ✅" : "tapi salah ❌"}.` +
      (ps.confidence[i] === "sure" && !ok ? " Hati-hati terlalu percaya diri; cermati lagi soal seperti ini." :
       ps.confidence[i] === "guess" && ok ? " Tebakan tepat — perkuat dasarnya agar lain kali yakin." : "")));
  }
  // Klasifikasi error per-soal: bantu user bedakan ceroboh vs konsep belum kuat.
  if (revealed && chosen != null && q.order[chosen] !== q.answer) {
    const ek = errorKind(q, ps.times[i]);
    if (ek) card.appendChild(el("div", { class: "q-meta", style: "margin-top:12px;padding:8px 12px;border-radius:8px;background:var(--surface-soft)" },
      `${ek.icon} ${ek.label}. ${ek.tip}`));
  }
  // Petunjuk kecepatan untuk soal yang dijawab (benar maupun salah).
  if (revealed && chosen != null) {
    const sh = speedHint(q, ps.times[i]);
    if (sh) card.appendChild(el("div", { class: "q-meta", style: "margin-top:8px" }, sh));
  }
  if (revealed && q.pembahasan) card.appendChild(el("div", { class: "pembahasan" }, [el("strong", {}, "Pembahasan: "), el("span", { html: renderMath(q.pembahasan) })]));
  if (revealed) { const sbPr = stepsBlock(q, true); if (sbPr) card.appendChild(sbPr); }

  const lastQ = i === ps.pool.length - 1;
  if (revealed) {
    card.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
      el("span", { style: "flex:1" }),
      el("button", { class: "btn dark", onclick: () => lastQ ? finishPractice() : nextPractice() }, lastQ ? "Selesai →" : "Lanjut →"),
    ]));
  } else if (ps.calibrate && pending != null) {
    card.appendChild(el("div", { class: "q-meta", style: "margin-top:16px" }, "Seberapa yakin dengan jawaban ini?"));
    card.appendChild(el("div", { class: "btn-row", style: "margin-top:8px" }, [
      el("button", { class: "btn", onclick: () => pickConfidence("sure") }, "💪 Yakin (Y)"),
      el("button", { class: "btn", onclick: () => pickConfidence("unsure") }, "🤔 Ragu (R)"),
      el("button", { class: "btn", onclick: () => pickConfidence("guess") }, "🎲 Tebak (T)"),
      el("span", { style: "flex:1" }),
      el("button", { class: "btn sm", onclick: () => skipPractice() }, "Lewati →"),
    ]));
  } else {
    card.appendChild(el("div", { class: "btn-row", style: "margin-top:18px" }, [
      el("div", { class: "q-meta", style: "align-self:center" }, ps.calibrate ? "Pilih jawaban (tombol 1–5 / A–E), lalu nilai keyakinanmu." : "Pilih jawaban (atau tombol 1–5 / A–E) untuk melihat kunci & pembahasan."),
      el("span", { style: "flex:1" }),
      el("button", { class: "btn", onclick: () => skipPractice() }, "Lewati →"),
    ]));
  }
  root.appendChild(card);
}
function answerPractice(displayIdx) {
  const ps = practiceState, i = ps.idx;
  if (ps.revealed[i]) return;
  if (ps.calibrate) { ps.pending[i] = displayIdx; renderPracticeSession(); } // tunggu rating keyakinan
  else finalizeAnswer(displayIdx, null);
}
function pickConfidence(conf) {
  const ps = practiceState, i = ps.idx;
  if (ps.revealed[i] || ps.pending[i] == null) return;
  finalizeAnswer(ps.pending[i], conf);
}
function finalizeAnswer(displayIdx, conf) {
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  if (ps.revealed[i]) return;
  const timeMs = Date.now() - (ps.qStart || Date.now());
  ps.answers[i] = displayIdx; ps.revealed[i] = true; ps.confidence[i] = conf; ps.times[i] = timeMs;
  const ok = q.order[displayIdx] === q.answer;
  if (ok) ps.correct++; else ps.wrong++;
  recordQStat(q.id, ok ? "correct" : "wrong", timeMs, q.order[displayIdx]);
  if (conf) recordCalibration(conf, ok);
  saveStore();
  renderPracticeSession();
}
function skipPractice() {
  const ps = practiceState, i = ps.idx, q = ps.pool[i];
  if (ps.revealed[i]) return;
  ps.revealed[i] = true; ps.pending[i] = null;
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
    if (ps.calibrate && ps.pending[i] != null && (key === "y" || key === "r" || key === "t")) {
      e.preventDefault(); pickConfidence(key === "y" ? "sure" : key === "r" ? "unsure" : "guess"); return;
    }
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
const ROLE_KEY = "tryout_simak_ui_role";
let progTimer = null, contentTimer = null;

function authToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
function authEmail() { try { return localStorage.getItem(EMAIL_KEY); } catch (e) { return null; } }
function authRole() { try { return localStorage.getItem(ROLE_KEY) || "user"; } catch (e) { return "user"; } }
function isLoggedIn() { return !!authToken(); }
function isAdmin() { return isLoggedIn() && authRole() === "admin"; }
function setAuth(token, email, role) {
  try { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(EMAIL_KEY, email); localStorage.setItem(ROLE_KEY, role || "user"); } catch (e) { /* abaikan */ }
  updateAccountNav();
}
function clearAuth() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EMAIL_KEY); localStorage.removeItem(ROLE_KEY); } catch (e) { /* abaikan */ }
  updateAccountNav();
}
function updateAccountNav() {
  const acc = document.querySelector('.navbtn[data-view="account"]');
  if (acc) {
    const label = acc.querySelector(".nav-label") || acc;
    label.textContent = isLoggedIn() ? (isAdmin() ? "Admin" : "Akun") : "Masuk";
  }
  document.body.classList.toggle("logged-in", isLoggedIn());
  document.body.classList.toggle("is-admin", isAdmin());
}
// Keluar dari akun: bersihkan token & cache lokal agar data pengguna tak tercampur.
function doLogout(silent) {
  clearAuth();
  try { stopTimer(); } catch (e) { /* abaikan */ }
  examState = null; try { clearExam(); } catch (e) { /* abaikan */ }
  store = normalizeStore({});
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* abaikan */ }
  if (!silent) go("account");
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
function handleAuthErr(e) {
  if (/terautentikasi|valid|kedaluwarsa/i.test(e.message)) { doLogout(true); toast("Sesi berakhir, silakan masuk lagi"); go("account"); }
  else setSyncStatus("Gagal sinkron: " + e.message);
}
function setSyncStatus(msg) { const el2 = document.getElementById("syncStatus"); if (el2) el2.textContent = msg; }
function cacheStore() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* abaikan */ } }

/* Konten = paket + soal (terpusat, dikelola admin). Progres = milik tiap user. */
function contentData() { return { packages: store.packages || [], questions: store.questions || [] }; }
function progressData() {
  return {
    records: store.records || {}, achievements: store.achievements || {},
    qstats: store.qstats || {}, bookmarks: store.bookmarks || {}, practiceLog: store.practiceLog || [],
    calib: store.calib || {}, settings: store.settings || {}, daily: store.daily || {},
    dailyMs: store.dailyMs || {}, qnotes: store.qnotes || {},
  };
}
function applyContent(data) {
  store.packages = Array.isArray(data && data.packages) ? data.packages : [];
  store.questions = Array.isArray(data && data.questions) ? data.questions : [];
  normalizeStore(store); cacheStore();
}
function applyProgress(data, updatedAt) {
  data = data || {};
  store.records = data.records || {};
  store.achievements = data.achievements || {};
  store.qstats = data.qstats || {};
  store.bookmarks = data.bookmarks || {};
  store.practiceLog = data.practiceLog || [];
  store.daily = data.daily || {};
  store.dailyMs = data.dailyMs || {};
  store.qnotes = data.qnotes || {};
  if (data.calib) store.calib = data.calib;
  if (data.settings) store.settings = data.settings;
  store._updatedAt = updatedAt || 0;
  normalizeStore(store); cacheStore();
}

// Dipanggil saat ada perubahan (saveStore): dorong progres; konten hanya jika admin.
function schedulePush() {
  if (!isLoggedIn()) return;
  clearTimeout(progTimer); progTimer = setTimeout(pushProgress, 1500);
  if (isAdmin()) { clearTimeout(contentTimer); contentTimer = setTimeout(pushContent, 1500); }
}
async function pushProgress() {
  if (!isLoggedIn()) return;
  try {
    await api("/progress", { method: "PUT", token: authToken(), body: { data: progressData(), updatedAt: store._updatedAt || Date.now() } });
    setSyncStatus("Progres tersinkron ✓ " + fmtDate(Date.now()));
  } catch (e) { handleAuthErr(e); }
}
async function pushContent() {
  if (!isAdmin()) return;
  try {
    await api("/content", { method: "PUT", token: authToken(), body: { data: contentData(), updatedAt: Date.now() } });
    setSyncStatus("Konten tersinkron ✓ " + fmtDate(Date.now()));
  } catch (e) { handleAuthErr(e); }
}

function refreshView() { if (!examState) go(currentView || "home"); }

// Tarik konten pusat + progres user dari server, terapkan ke store.
async function syncOnLogin({ silent = false } = {}) {
  if (!isLoggedIn()) return;
  // 1) Konten terpusat (server = sumber kebenaran)
  try {
    const c = await api("/content", { token: authToken() });
    const d = c.data || {};
    const remoteHasContent = Array.isArray(d.packages) && (d.packages.length || (Array.isArray(d.questions) && d.questions.length));
    if (remoteHasContent) {
      applyContent(d);
    } else if (isAdmin() && store.packages && store.packages.length) {
      await pushContent(); // admin pertama kali: jadikan konten lokal (seed) sebagai konten pusat
      if (!silent) toast("Konten awal diunggah sebagai konten pusat");
    } else {
      applyContent({ packages: [], questions: [] }); // user: belum ada konten dari admin
    }
  } catch (e) { handleAuthErr(e); if (!silent) toast("Gagal memuat konten: " + e.message); }
  // 2) Progres user (last-write-wins)
  try {
    const p = await api("/progress", { token: authToken() });
    const remoteTs = p.updatedAt || 0, localTs = store._updatedAt || 0;
    const remoteHas = p.data && typeof p.data === "object";
    if (remoteHas && remoteTs >= localTs) applyProgress(p.data, remoteTs);
    else if (localTs > remoteTs && (Object.keys(store.records || {}).length || Object.keys(store.qstats || {}).length)) await pushProgress();
  } catch (e) { handleAuthErr(e); }
  refreshView();
}

function renderAccount() {
  const root = app();
  root.innerHTML = "";

  if (isLoggedIn()) {
    document.body.classList.remove("auth-screen");
    root.appendChild(el("h2", { class: "page-title" }, "Akun"));
    const panel = el("div", { class: "card", style: "max-width:520px" }, [
      el("div", { class: "q-meta" }, "Masuk sebagai"),
      el("div", { style: "display:flex;align-items:center;gap:10px;margin:2px 0 12px" }, [
        el("h3", { style: "margin:0" }, authEmail() || "—"),
        el("span", { class: "role-badge " + (isAdmin() ? "admin" : "user") }, isAdmin() ? "ADMIN" : "USER"),
      ]),
      el("div", { id: "syncStatus", class: "q-meta", style: "margin-bottom:14px" }, "Sinkron otomatis aktif."),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn primary", onclick: async () => { setSyncStatus("Menyinkronkan…"); await syncOnLogin(); setSyncStatus("Selesai disinkron ✓ " + fmtDate(Date.now())); } }, "🔄 Sinkronkan sekarang"),
        el("button", { class: "btn danger", onclick: () => confirmModal("Keluar dari akun?", "Kamu perlu masuk lagi untuk memakai aplikasi.", () => { doLogout(); toast("Berhasil keluar"); }, "Ya, keluar") }, "Keluar"),
      ]),
    ]);
    if (isAdmin()) {
      panel.appendChild(el("div", { class: "divider" }));
      panel.appendChild(el("div", { class: "q-meta", style: "margin-bottom:8px" }, "Panel admin"));
      panel.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => go("input") }, "📝 Kelola Soal & Paket"),
        el("button", { class: "btn", onclick: () => go("adminusers") }, "👥 Kelola User"),
      ]));
    }
    root.appendChild(panel);
    return;
  }

  // Belum login — layar masuk penuh (kartu di tengah, ala onboarding)
  document.body.classList.add("auth-screen");
  const emailIn = el("input", { type: "text", id: "accEmail", placeholder: "nama@email.com", autocomplete: "username" });
  const passIn = el("input", { type: "password", id: "accPass", placeholder: "Minimal 6 karakter", autocomplete: "current-password" });
  const msg = el("div", { class: "auth-msg", style: "min-height:18px;color:var(--red)" }, "");
  let mode = "login";
  const submit = async (m) => {
    const email = emailIn.value.trim(), password = passIn.value;
    msg.style.color = "var(--red)"; msg.textContent = "";
    if (!email || !password) { msg.textContent = "Isi email & password."; return; }
    try {
      const out = await api(m === "register" ? "/register" : "/login", { method: "POST", body: { email, password } });
      setAuth(out.token, out.email, out.role);
      msg.style.color = "var(--green)";
      msg.textContent = "Berhasil. Menyiapkan data…";
      await syncOnLogin({ silent: true });
      updateAccountNav();
      go("home");
      toast("Selamat datang, " + out.email + (out.role === "admin" ? " (admin)" : ""));
    } catch (e) { msg.textContent = e.message; }
  };

  const title = el("h2", { class: "auth-title" }, "Masuk");
  const sub = el("p", { class: "auth-sub" }, "Masuk untuk mulai belajar. Progresmu tersimpan & sinkron di semua perangkat.");
  const submitBtn = el("button", { class: "btn primary auth-submit", onclick: () => submit(mode) }, "Masuk");
  const switchLink = el("button", { class: "auth-link", type: "button" }, "Daftar baru");
  const switchLine = el("p", { class: "auth-foot" }, ["Belum punya akun? ", switchLink]);
  // Beralih antara mode Masuk & Daftar (mirip alur onboarding).
  switchLink.addEventListener("click", () => {
    mode = mode === "login" ? "register" : "login";
    const reg = mode === "register";
    title.textContent = reg ? "Daftar Akun" : "Masuk";
    sub.textContent = reg ? "Buat akun baru untuk menyimpan & menyinkronkan progresmu."
                          : "Masuk untuk mulai belajar. Progresmu tersimpan & sinkron di semua perangkat.";
    submitBtn.textContent = reg ? "Daftar" : "Masuk";
    switchLine.replaceChildren(reg ? "Sudah punya akun? " : "Belum punya akun? ", switchLink);
    switchLink.textContent = reg ? "Masuk di sini" : "Daftar baru";
    passIn.setAttribute("autocomplete", reg ? "new-password" : "current-password");
    msg.textContent = "";
  });
  passIn.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(mode); });

  const card = el("div", { class: "auth-card" }, [
    el("div", { class: "auth-brand" }, [
      el("span", { class: "logo" }, "UI"),
      el("div", { class: "auth-brand-text" }, [
        el("strong", {}, "Tryout SIMAK UI"),
        el("span", {}, "Pascasarjana"),
      ]),
    ]),
    title,
    sub,
    field("Email", emailIn),
    field("Password", passIn),
    msg,
    submitBtn,
    switchLine,
  ]);
  root.appendChild(el("div", { class: "auth-wrap" }, [
    el("div", { class: "auth-decor", "aria-hidden": "true" }),
    card,
  ]));
}

/* ---------- Admin: kelola user ---------- */
async function renderAdminUsers() {
  const root = app();
  root.innerHTML = "";
  root.appendChild(el("h2", { class: "page-title" }, "Kelola User"));
  if (!isAdmin()) { root.appendChild(emptyState("🔒", "Khusus admin", "Halaman ini hanya untuk admin.")); return; }
  const card = el("div", { class: "card", style: "padding:0;overflow:hidden" }, [el("div", { class: "q-meta", style: "padding:16px" }, "Memuat…")]);
  root.appendChild(card);
  try {
    const out = await api("/admin/users", { token: authToken() });
    card.innerHTML = "";
    const table = el("table", { class: "subj" });
    table.appendChild(el("tr", {}, [el("th", {}, "Email"), el("th", {}, "Peran"), el("th", {}, "Terdaftar"), el("th", {}, "Aksi")]));
    out.users.forEach((u) => {
      const isMe = u.email === authEmail();
      const action = (u.role === "admin" || isMe)
        ? el("span", { class: "q-meta" }, isMe ? "(kamu)" : "—")
        : el("button", { class: "btn sm danger", onclick: () => confirmModal("Hapus user?", `User "${u.email}" beserta seluruh progresnya akan dihapus permanen.`, async () => {
            try { await api("/admin/users/" + u.id, { method: "DELETE", token: authToken() }); toast("User dihapus"); renderAdminUsers(); }
            catch (e) { toast("Gagal: " + e.message); }
          }, "Ya, hapus") }, "Hapus");
      table.appendChild(el("tr", {}, [
        el("td", {}, u.email),
        el("td", {}, el("span", { class: "role-badge " + (u.role === "admin" ? "admin" : "user") }, u.role.toUpperCase())),
        el("td", {}, fmtDate(new Date(u.created_at).getTime())),
        el("td", {}, action),
      ]));
    });
    card.appendChild(table);
    card.appendChild(el("div", { class: "q-meta", style: "padding:12px 16px" }, `Total: ${out.users.length} user`));
  } catch (e) {
    card.innerHTML = "";
    card.appendChild(el("div", { class: "q-meta", style: "padding:16px;color:var(--red)" }, "Gagal memuat: " + e.message));
    handleAuthErr(e);
  }
}

/* ---------- Admin: hasil ujian semua user ---------- */
async function renderAdminResults() {
  const root = app();
  root.innerHTML = "";
  document.body.classList.remove("auth-screen");
  root.appendChild(el("h2", { class: "page-title" }, "Hasil Ujian"));
  if (!isAdmin()) { root.appendChild(emptyState("🔒", "Khusus admin", "Halaman ini hanya untuk admin.")); return; }

  const status = el("div", { class: "q-meta" }, "Memuat…");
  root.appendChild(status);
  let out;
  try {
    out = await api("/admin/results", { token: authToken() });
  } catch (e) {
    status.style.color = "var(--red)"; status.textContent = "Gagal memuat: " + e.message; handleAuthErr(e); return;
  }
  status.remove();

  const pkgName = {};
  (out.packages || []).forEach((p) => { pkgName[p.id] = p.name; });
  const users = out.users || [];
  const attemptsOf = (u) => Object.values(u.records || {}).reduce((a, r) => a + (r.attempts || 0), 0);
  const totalAttempts = users.reduce((a, u) => a + attemptsOf(u), 0);
  const activeUsers = users.filter((u) => attemptsOf(u) > 0).length;
  const pct = (n) => Math.round(n || 0) + "%";

  root.appendChild(el("div", { class: "stat-cards" }, [
    el("div", { class: "stat-card" }, [el("div", { class: "sc-ic" }, "👥"), el("div", {}, [el("div", { class: "sc-val" }, String(users.length)), el("div", { class: "sc-lbl" }, "Total user")])]),
    el("div", { class: "stat-card" }, [el("div", { class: "sc-ic" }, "✅"), el("div", {}, [el("div", { class: "sc-val" }, String(activeUsers)), el("div", { class: "sc-lbl" }, "Pernah tryout")])]),
    el("div", { class: "stat-card" }, [el("div", { class: "sc-ic" }, "📝"), el("div", {}, [el("div", { class: "sc-val" }, String(totalAttempts)), el("div", { class: "sc-lbl" }, "Total percobaan")])]),
  ]));

  const search = el("input", { type: "text", placeholder: "Cari email user…", style: "max-width:340px;margin:4px 0 20px" });
  root.appendChild(search);
  const listWrap = el("div", {});
  root.appendChild(listWrap);

  function userCard(u) {
    const recs = u.records || {};
    const pids = Object.keys(recs);
    const n = attemptsOf(u);
    const head = el("div", { style: "display:flex;align-items:center;gap:10px;flex-wrap:wrap" }, [
      el("h3", { style: "margin:0;font-size:16px" }, u.email),
      el("span", { class: "role-badge " + (u.role === "admin" ? "admin" : "user") }, u.role.toUpperCase()),
      el("span", { class: "chip" }, n ? `${n}× tryout` : "belum tryout"),
    ]);
    const card = el("div", { class: "card", style: "margin-bottom:16px" }, [head]);
    if (!pids.length) { card.appendChild(el("div", { class: "q-meta", style: "margin-top:8px" }, "Belum mengerjakan tryout.")); return card; }
    pids.sort((a, b) => (recs[b].attempts || 0) - (recs[a].attempts || 0));
    const table = el("table", { class: "subj", style: "margin-top:12px" });
    table.appendChild(el("tr", {}, ["Paket", "Rekor", "Skor terakhir", "Percobaan", "Terakhir"].map((h) => el("th", {}, h))));
    pids.forEach((pid) => {
      const r = recs[pid];
      const hist = r.history || [];
      const last = hist[hist.length - 1];
      const bestTxt = r.best ? `${r.best.score} · ${pct(r.best.pct)}` : "—";
      const lastTxt = last ? `${last.score} · ${pct(last.pct)}` : (r.lastScore != null ? String(r.lastScore) : "—");
      const lastDate = last ? fmtDate(last.date) : (r.best ? fmtDate(r.best.date) : "—");
      table.appendChild(el("tr", {}, [
        el("td", {}, pkgName[pid] || el("span", { class: "q-meta" }, "(paket dihapus)")),
        el("td", {}, el("strong", {}, bestTxt)),
        el("td", {}, lastTxt),
        el("td", {}, String(r.attempts || hist.length || 0)),
        el("td", {}, lastDate),
      ]));
      if (hist.length) {
        const det = el("details", { class: "bank-materi" }, [el("summary", {}, `Riwayat ${hist.length} percobaan`)]);
        const ht = el("table", { class: "subj" });
        ht.appendChild(el("tr", {}, ["#", "Tanggal", "Skor", "Benar/Salah/Kosong", "Durasi"].map((h) => el("th", {}, h))));
        hist.slice().reverse().forEach((h, i) => {
          ht.appendChild(el("tr", {}, [
            el("td", {}, String(hist.length - i)),
            el("td", {}, fmtDate(h.date)),
            el("td", {}, `${h.score} · ${pct(h.pct)}`),
            el("td", {}, `${h.correct}/${h.wrong}/${h.empty}`),
            el("td", {}, h.durationMs ? fmtDur(h.durationMs) : "—"),
          ]));
        });
        det.appendChild(el("div", { class: "bank-materi-body" }, [ht]));
        table.appendChild(el("tr", {}, [el("td", { colspan: "5", style: "padding:0 12px 12px" }, det)]));
      }
    });
    card.appendChild(table);
    return card;
  }

  function paint() {
    const q = search.value.trim().toLowerCase();
    const sorted = users
      .filter((u) => !q || u.email.toLowerCase().includes(q))
      .sort((a, b) => attemptsOf(b) - attemptsOf(a) || a.email.localeCompare(b.email));
    listWrap.innerHTML = "";
    if (!sorted.length) { listWrap.appendChild(emptyState("🔍", "Tak ada user cocok", "Coba kata kunci lain.")); return; }
    sorted.forEach((u) => listWrap.appendChild(userCard(u)));
  }
  search.addEventListener("input", paint);
  paint();
}

/* ---------- Tema gelap/terang ---------- */
const THEME_KEY = "tryout_simak_ui_theme";
function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
function applyThemeIcon() {
  const b = document.getElementById("themeToggle");
  if (b) { const dark = currentTheme() === "dark"; b.innerHTML = dark ? ICON_SUN : ICON_MOON; b.title = dark ? "Beralih ke tema terang" : "Beralih ke tema gelap"; }
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

/* ---------- Sidebar: lipat (desktop) & buka/tutup (mobile) ---------- */
(function initSidebar() {
  const root = document.documentElement;
  const SIDEBAR_KEY = "tryout_simak_ui_sidebar";
  const backdrop = document.getElementById("sidebarBackdrop");

  // Lipat / bentangkan di desktop (kondisi disimpan agar bertahan).
  const collapseBtn = document.getElementById("sidebarCollapse");
  if (collapseBtn) collapseBtn.addEventListener("click", () => {
    const collapsed = root.classList.toggle("sidebar-collapsed");
    try { localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded"); } catch (e) { /* abaikan */ }
  });

  // Drawer di layar kecil.
  function openDrawer() {
    root.classList.add("sidebar-open");
    if (backdrop) backdrop.hidden = false;
  }
  function closeDrawer() {
    root.classList.remove("sidebar-open");
    if (backdrop) backdrop.hidden = true;
  }
  const openBtn = document.getElementById("sidebarOpen");
  if (openBtn) openBtn.addEventListener("click", openDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  // Memilih menu di mobile otomatis menutup drawer.
  const nav = document.getElementById("mainnav");
  if (nav) nav.addEventListener("click", e => { if (e.target.closest(".navbtn")) closeDrawer(); });
  // Tombol Esc menutup drawer.
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
})();

/* ---------- boot ---------- */
updateAccountNav();
if (!isLoggedIn()) {
  go("account");                         // wajib login
} else if (tryRestoreExam()) {
  go("exam");
  toast("Tryout sebelumnya dilanjutkan dari posisi terakhir");
  syncOnLogin({ silent: true });         // segarkan data di latar belakang (tidak mengganggu ujian)
} else {
  go("home");
  syncOnLogin({ silent: true });         // tarik konten pusat + progres
  maybeRemindReviews();                  // notifikasi bila ada review jatuh tempo (jika diaktifkan)
}
