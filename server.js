// Tryout SIMAK UI — server: konten terpusat (dikelola admin) + progres per-user + akun/role.
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
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

if (!process.env.JWT_SECRET) console.warn("⚠️  JWT_SECRET belum di-set — set di environment untuk produksi.");
if (!DATABASE_URL) console.warn("⚠️  DATABASE_URL belum di-set — fitur akun/sync akan gagal sampai DB tersedia.");
if (!ADMIN_EMAIL) console.warn("⚠️  ADMIN_EMAIL belum di-set — tidak ada akun yang otomatis jadi admin.");

const pool = DATABASE_URL
  ? new pg.Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false })
  : null;

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
  -- progres per-user (rekor, statistik, bookmark, dll.)
  CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB,
    updated_at BIGINT NOT NULL DEFAULT 0
  );
  -- konten terpusat (paket + soal) — satu baris (id=1), hanya admin yang ubah
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB,
    updated_at BIGINT NOT NULL DEFAULT 0
  );
`;
async function initDb(retries = 15) {
  if (!pool) return;
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(SCHEMA_SQL);
      if (ADMIN_EMAIL) await pool.query("UPDATE users SET role='admin' WHERE lower(email)=$1", [ADMIN_EMAIL]);
      console.log("✅ Skema database siap." + (ADMIN_EMAIL ? ` (admin: ${ADMIN_EMAIL})` : ""));
      return;
    } catch (e) {
      console.warn(`⏳ DB belum siap (${i}/${retries}): ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("❌ Gagal menyiapkan skema DB setelah beberapa percobaan.");
}

const app = express();
app.use(express.json({ limit: "12mb" }));

// ---------- Helpers ----------
const normEmail = (e) => String(e || "").trim().toLowerCase();
const roleFor = (email) => (ADMIN_EMAIL && normEmail(email) === ADMIN_EMAIL ? "admin" : "user");
function signToken(user) { return jwt.sign({ uid: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "180d" }); }
function auth(req, res, next) {
  const m = (req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "Tidak terautentikasi" });
  try { req.user = jwt.verify(m[1], JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: "Sesi tidak valid / kedaluwarsa" }); }
}
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Khusus admin" });
}
function requireDb(_req, res, next) {
  if (!pool) return res.status(503).json({ error: "Database belum dikonfigurasi di server" });
  next();
}

// ---------- API: akun ----------
app.get("/api/health", (_req, res) => res.json({ ok: true, db: !!pool }));

app.post("/api/register", requireDb, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email tidak valid" });
    if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
    const hash = await bcrypt.hash(password, 10);
    const role = roleFor(email);
    let rows;
    try {
      ({ rows } = await pool.query("INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role", [email, hash, role]));
    } catch (e) {
      if (e.code === "23505") return res.status(409).json({ error: "Email sudah terdaftar" });
      throw e;
    }
    const user = rows[0];
    await pool.query("INSERT INTO user_data (user_id, data, updated_at) VALUES ($1, NULL, 0) ON CONFLICT DO NOTHING", [user.id]);
    res.json({ token: signToken(user), email: user.email, role: user.role });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal mendaftar" }); }
});

app.post("/api/login", requireDb, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || "");
    const { rows } = await pool.query("SELECT id, email, password_hash, role FROM users WHERE email=$1", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Email atau password salah" });
    // pastikan role admin tersinkron bila email == ADMIN_EMAIL
    const wanted = roleFor(email);
    if (wanted === "admin" && user.role !== "admin") {
      await pool.query("UPDATE users SET role='admin' WHERE id=$1", [user.id]); user.role = "admin";
    }
    res.json({ token: signToken(user), email: user.email, role: user.role });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal masuk" }); }
});

// ---------- API: konten terpusat (paket + soal) ----------
app.get("/api/content", requireDb, auth, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT data, updated_at FROM content WHERE id=1");
    const row = rows[0] || { data: null, updated_at: 0 };
    res.json({ data: row.data, updatedAt: Number(row.updated_at) || 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal memuat konten" }); }
});

app.put("/api/content", requireDb, auth, adminOnly, async (req, res) => {
  try {
    const data = req.body.data;
    const updatedAt = Number(req.body.updatedAt) || Date.now();
    if (data == null || typeof data !== "object") return res.status(400).json({ error: "Konten tidak valid" });
    await pool.query(
      `INSERT INTO content (id, data, updated_at) VALUES (1,$1,$2)
       ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data, updated_at=EXCLUDED.updated_at`,
      [data, updatedAt]
    );
    res.json({ ok: true, updatedAt });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal menyimpan konten" }); }
});

// ---------- API: progres per-user ----------
app.get("/api/progress", requireDb, auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT data, updated_at FROM user_data WHERE user_id=$1", [req.user.uid]);
    const row = rows[0] || { data: null, updated_at: 0 };
    res.json({ data: row.data, updatedAt: Number(row.updated_at) || 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal memuat progres" }); }
});

app.put("/api/progress", requireDb, auth, async (req, res) => {
  try {
    const data = req.body.data;
    const updatedAt = Number(req.body.updatedAt) || Date.now();
    if (data == null || typeof data !== "object") return res.status(400).json({ error: "Progres tidak valid" });
    await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at) VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET data=EXCLUDED.data, updated_at=EXCLUDED.updated_at`,
      [req.user.uid, data, updatedAt]
    );
    res.json({ ok: true, updatedAt });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal menyimpan progres" }); }
});

// ---------- API: admin (kelola user) ----------
app.get("/api/admin/users", requireDb, auth, adminOnly, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, email, role, created_at FROM users ORDER BY created_at ASC");
    res.json({ users: rows });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal memuat daftar user" }); }
});

app.delete("/api/admin/users/:id", requireDb, auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID tidak valid" });
    if (id === req.user.uid) return res.status(400).json({ error: "Tidak bisa menghapus akun sendiri" });
    const { rows } = await pool.query("SELECT email, role FROM users WHERE id=$1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "User tidak ditemukan" });
    if (rows[0].role === "admin") return res.status(400).json({ error: "Tidak bisa menghapus admin" });
    await pool.query("DELETE FROM users WHERE id=$1", [id]); // user_data ikut terhapus (ON DELETE CASCADE)
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal menghapus user" }); }
});

// Rekap hasil ujian seluruh user (rekor & riwayat per paket) — khusus admin.
app.get("/api/admin/results", requireDb, auth, adminOnly, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, ud.data, ud.updated_at
       FROM users u LEFT JOIN user_data ud ON ud.user_id = u.id
       ORDER BY u.created_at ASC`
    );
    const c = await pool.query("SELECT data FROM content WHERE id=1");
    const content = (c.rows[0] && c.rows[0].data) || {};
    const packages = (content.packages || []).map((p) => ({ id: p.id, name: p.name || p.title || "(Tanpa nama)" }));
    const users = rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      updatedAt: Number(r.updated_at) || 0,
      records: (r.data && r.data.records) || {},
    }));
    res.json({ packages, users });
  } catch (e) { console.error(e); res.status(500).json({ error: "Gagal memuat hasil ujian" }); }
});

// ---------- Static frontend ----------
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

initDb()
  .catch((e) => console.error("Gagal init DB:", e.message))
  .finally(() => app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`)));
