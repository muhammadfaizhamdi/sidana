import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Mengambil koneksi database yang kita buat di Tahap 2 sebelumnya

// GET: Mengambil semua data dari database untuk ditampilkan ke Ledger/Dashboard
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari database" }, { status: 500 });
  }
}

// POST: Menerima data dari Form Modal dan menyimpannya ke database
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, source, category, type, date } = body;

    const query = `
      INSERT INTO transactions (amount, source, category, type, date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [amount, source, category, type, date];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}

// DELETE: Menghapus data dari database berdasarkan ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    return NextResponse.json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}

// PUT: Memperbarui data transaksi yang sudah ada
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, amount, source, category, type, date } = body;

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    const query = `
      UPDATE transactions
      SET amount = $1, source = $2, category = $3, type = $4, date = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [amount, source, category, type, date, id];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
  }
}