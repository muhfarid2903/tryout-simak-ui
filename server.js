// Tryout SIMAK UI — server: menyajikan frontend statis + API login & sinkron.
// Offline-first: frontend tetap berjalan tanpa server; server hanya untuk akun & sync.
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pg from "pg";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-ganti-di-produksi";
const DATABASE_URL = process.env.DATABASE_URL;

if (!process.env.JWT_SECRET) console.warn("⚠️  JWT_SECRET belum di-set — set di environment untuk produksi.");
if (!DATABASE_URL) console.warn("⚠️  DATABASE_URL belum di-set — endpoint akun/sync akan gagal sampai DB tersedia.");

const pool = DATABASE_URL
  ? new pg.Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false })
  : null;

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB,
    updated_at BIGINT NOT NULL DEFAULT 0
  );
`;
// Coba buat skema dengan retry — Postgres kadang baru siap beberapa detik setelah app.
async function initDb(retries = 15) {
  if (!pool) return;
  for (let i = 1; i <= retries; i++) {
    try { await pool.query(SCHEMA_SQL); console.log("✅ Skema database siap."); return; }
    catch (e) {
      console.warn(`⏳ DB belum siap (${i}/${retries}): ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("❌ Gagal menyiapkan skema DB setelah beberapa percobaan.");
}

const app = express();
app.use(express.json({ limit: "8mb" }));

// ---------- Helpers ----------
const normEmail = (e) => String(e || "").trim().toLowerCase();
function signToken(user) { return jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: "180d" }); }
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "Tidak terautentikasi" });
  try { req.user = jwt.verify(m[1], JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: "Sesi tidak valid / kedaluwarsa" }); }
}
function requireDb(_req, res, next) {
  if (!pool) return res.status(503).json({ error: "Database belum dikonfigurasi di server" });
  next();
}

// ---------- API ----------
app.get("/api/health", (_req, res) => res.json({ ok: true, db: !!pool }));

app.post("/api/register", requireDb, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email tidak valid" });
    if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
    const hash = await bcrypt.hash(password, 10);
    let rows;
    try {
      ({ rows } = await pool.query("INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email", [email, hash]));
    } catch (e) {
      if (e.code === "23505") return res.status(409).json({ error: "Email sudah terdaftar" });
      throw e;
    }
    const user = rows[0];
    await pool.query("INSERT INTO user_data (user_id, data, updated_at) VALUES ($1, NULL, 0) ON CONFLICT DO NOTHING", [user.id]);
    res.json({ token: signToken(user), email: user.email });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal mendaftar" }); }
});

app.post("/api/login", requireDb, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || "");
    const { rows } = await pool.query("SELECT id, email, password_hash FROM users WHERE email=$1", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Email atau password salah" });
    res.json({ token: signToken(user), email: user.email });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal masuk" }); }
});

app.get("/api/data", requireDb, auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT data, updated_at FROM user_data WHERE user_id=$1", [req.user.uid]);
    const row = rows[0] || { data: null, updated_at: 0 };
    res.json({ data: row.data, updatedAt: Number(row.updated_at) || 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal memuat data" }); }
});

app.put("/api/data", requireDb, auth, async (req, res) => {
  try {
    const data = req.body.data;
    const updatedAt = Number(req.body.updatedAt) || Date.now();
    if (data == null || typeof data !== "object") return res.status(400).json({ error: "Data tidak valid" });
    await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at) VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET data=EXCLUDED.data, updated_at=EXCLUDED.updated_at`,
      [req.user.uid, data, updatedAt]
    );
    res.json({ ok: true, updatedAt });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal menyimpan data" }); }
});

// ---------- Static frontend ----------
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

initDb()
  .catch((e) => console.error("Gagal init DB:", e.message))
  .finally(() => app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`)));
