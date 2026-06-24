# Prompt Generator Soal — per Program

Tiap file di folder ini adalah **prompt mandiri** untuk membuat satu paket soal
(siap di-import) untuk satu program/ruangan di aplikasi. Tempel seluruh blok di
antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===` ke LLM yang kuat
(Claude/GPT), ubah bagian **PARAMETER** bila perlu, lalu import hasil JSON-nya
lewat **Input Soal → ⬆ Import** (pilih *Tambahkan* agar tergabung).

| Program (ruangan)        | File                                   |
|--------------------------|----------------------------------------|
| SIMAK UI (Sarjana)       | [simak-ui.md](simak-ui.md)             |
| SIMAK UI Pascasarjana    | [simak-ui-pascasarjana.md](simak-ui-pascasarjana.md) |
| TOEFL (ITP)              | [toefl.md](toefl.md)                   |
| SBMPTN (UTBK — TPS)      | [sbmptn.md](sbmptn.md)                 |
| UKMPPD (Dokter)          | [ukmppd.md](ukmppd.md)                 |

> Field `"program"` pada tiap prompt sudah disetel persis dengan nama ruangan di
> aplikasi (`SIMAK UI`, `SIMAK UI Pascasarjana`, `TOEFL`, `SBMPTN`,
> `UKMPPD (Dokter)`), sehingga paket otomatis masuk ke ruangan yang benar.

## Aturan umum (berlaku semua file)
- Output **HANYA JSON valid** — tanpa pagar ```` ``` ````, tanpa teks pembuka/penutup, tanpa *trailing comma*.
- Tiap soal: 5 `options` (A–E) + 5 `optExplain` sejajar; `answer` huruf `"A"`–`"E"`.
- **Jangan** sertakan `id` & `image` pada objek soal.
- Untuk paket besar, generate **per mata uji** (PARAMETER), pakai `id` paket yang **sama** tiap run agar tergabung.
- Rumus matematika: apit `$...$`, dan **setiap backslash ditulis dobel** dalam JSON (`"$\\frac{3}{4}$"`).

## Validasi cepat sebelum import (opsional)
```bash
node -e '
const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
let bad=0;
d.questions.forEach((q,i)=>{
  const e=[];
  if(!q.subject) e.push("subject kosong");
  if(![1,2,3].includes(q.difficulty)) e.push("difficulty bukan 1/2/3");
  if(!Array.isArray(q.options)||q.options.length!==5) e.push("options bukan 5");
  if(!/^[A-E]$/.test(String(q.answer))&&!Number.isInteger(q.answer)) e.push("answer bukan A-E/angka");
  if(q.optExplain&&q.optExplain.length!==q.options.length) e.push("optExplain tak sejajar");
  if(e.length){bad++;console.log(`Soal ${i+1}: `+e.join("; "));}
});
console.log(bad?`\n${bad} soal bermasalah`:`\nOK — ${d.questions.length} soal valid`);
' paket.json
```
