import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'faiz123',
  host: '127.0.0.1',
  port: 5432,
  database: 'sidana',
  connectionTimeoutMillis: 5000,
});

// Baris ini untuk menguji koneksi secara langsung di terminal
pool.connect()
  .then(() => console.log("BERHASIL: Node.js sukses terhubung ke PostgreSQL!"))
  .catch((err) => console.error("GAGAL: Tidak bisa terhubung. Alasan:", err.message));

export default pool;