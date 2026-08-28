import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Mengambil semua data target tabungan
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM goals ORDER BY target_date ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database Error (GET Goals):", error);
    return NextResponse.json({ error: "Gagal mengambil data target" }, { status: 500 });
  }
}

// POST: Menambah target tabungan baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, target_amount, target_date } = body;

    if (!name || !target_amount || !target_date) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const query = `
      INSERT INTO goals (name, target_amount, target_date)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, target_amount, target_date];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Database Error (POST Goals):", error);
    return NextResponse.json({ error: "Gagal menyimpan target" }, { status: 500 });
  }
}

// DELETE: Menghapus target tabungan
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
    return NextResponse.json({ message: "Target berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Database Error (DELETE Goals):", error);
    return NextResponse.json({ error: "Gagal menghapus target" }, { status: 500 });
  }
}