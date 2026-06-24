# Prompt: Paket Soal — TOEFL ITP

Tempel blok di antara `=== MULAI PROMPT ===` dan `=== AKHIR PROMPT ===`. Output =
JSON murni siap **Input Soal → ⬆ Import**. Program: **TOEFL**.

> Catatan: aplikasi ini berbasis teks, jadi **Section 1 (Listening) tidak dibuat**.
> Fokus pada **Section 2 (Structure & Written Expression)** dan **Section 3
> (Reading Comprehension)** — keduanya murni teks dan paling melatih skor.

=== MULAI PROMPT ===

You are an expert **TOEFL ITP** item writer (ETS-style). Produce **one complete
test package** as **valid JSON** following the exact schema below. **The questions
MUST be REALISTIC and authentic to the actual TOEFL ITP** — same item types,
phrasing conventions, academic register, and difficulty. Avoid trivial or
casual-English items.

## REAL BLUEPRINT (follow for authenticity)
TOEFL ITP Section 2 & 3:
- **Structure & Written Expression — 40 items, ~25 min:**
  - *Structure* (15 items): fill-in-the-blank, choose the option that correctly completes the sentence.
  - *Written Expression* (25 items): a sentence with four underlined parts (A–E here use 5 options); identify the underlined part containing the error.
- **Reading Comprehension — 50 items, ~55 min:** several academic passages (science,
  history, biography), each followed by questions: main idea, stated detail,
  inference, vocabulary-in-context, reference (pronoun), and "EXCEPT/NOT" items.
- Academic, formal English. Distractors reflect common ESL errors.

> **Cara pakai (BATCH → 1 paket lengkap):** generate **per mata uji** (20–25 soal/run)
> agar JSON tidak terpotong & mutu terjaga. Pakai `id` paket yang **sama persis**
> (`"toefl-itp-01"`) di tiap run, lalu import dengan opsi **Tambahkan** — semua batch
> otomatis tergabung menjadi **satu paket utuh** di aplikasi.

## PARAMETER (you may edit)
- Package name: "Tryout TOEFL ITP — {EDIT}"
- Mata uji this run (ONE per run recommended): {EDIT: "Structure & Written Expression" | "Reading Comprehension"}
- Number of items this run: {EDIT, e.g. 25}
- Difficulty mix: ~30% Easy (1), ~50% Medium (2), ~20% Hard (3).

## REQUIRED SCHEMA
```json
{
  "packages": [{
    "id": "toefl-itp-01",
    "name": "<package name>",
    "program": "TOEFL",
    "mode": "sections",
    "durationMin": 80,
    "sectionMinutes": { "Structure & Written Expression": 25, "Reading Comprehension": 55 },
    "shuffleQuestions": true,
    "shuffleOptions": true
  }],
  "questions": [ /* item objects */ ]
}
```

### Per-item fields
- `packageId`: always `"toefl-itp-01"`.
- `subject`: **exactly** `"Structure & Written Expression"` or `"Reading Comprehension"`.
- `subtopic`: pick from the lists below (keep spelling consistent).
- `difficulty`: `1` | `2` | `3`.
- `text`: the full item. For *Structure*, write the sentence with a blank `___`.
  For *Written Expression*, write the sentence and mark four candidate parts
  `(A) … (B) … (C) … (D) …` then ask to identify the error (5th option = "No error" only if appropriate).
  For *Reading*, put the **full passage (4–7 sentences)** then a blank line then the question.
- `options`: 5 strings (A–E).
- `answer`: letter `"A"`–`"E"`.
- `pembahasan`: 1–3 sentences (Indonesian or English) explaining why the key is correct.
- `optExplain`: 5 strings parallel to options — for each distractor, name the **grammar rule violated** or **why the inference is unsupported**.
- `steps`: `[]` (not needed for English items).
- Do NOT include `id` or `image`.

### SUB-TOPICS
- **Structure & Written Expression:** `"Subject-Verb Agreement"`, `"Tenses & Verb Forms"`, `"Parallelism"`, `"Articles & Determiners"`, `"Prepositions"`, `"Word Form / Word Choice"`, `"Clauses & Conjunctions"`, `"Reduced & Relative Clauses"`, `"Comparisons"`, `"Error Identification"`
- **Reading Comprehension:** `"Main Idea"`, `"Stated Detail"`, `"Inference"`, `"Vocabulary in Context"`, `"Reference (Pronoun)"`, `"Author's Purpose & Tone"`, `"NOT/EXCEPT"`, `"Restatement / Paraphrase"`

### QUALITY & REALISM (mandatory)
1. Match ETS register: formal, academic, unambiguous single key.
2. Structure items test one grammar point cleanly; distractors are *plausible* wrong forms.
3. Reading passages must be self-contained, factual, and academic (science/history/nature).
4. Vocabulary-in-context options should all be plausible meanings; only one fits the sentence.
5. Verify the key carefully.

## OUTPUT
ONLY valid JSON — no code fences, no extra text, no trailing comma.

=== AKHIR PROMPT ===
