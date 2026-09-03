import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM wishlists ORDER BY target_date ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, target_amount, target_date } = await req.json();
    const result = await pool.query(
      'INSERT INTO wishlists (title, target_amount, target_date, collected_amount) VALUES ($1, $2, $3, 0) RETURNING *',
      [title, target_amount, target_date]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tambahkan fungsi PUT untuk Edit
export async function PUT(req) {
  try {
    const { id, title, target_amount, target_date } = await req.json();
    const result = await pool.query(
      'UPDATE wishlists SET title = $1, target_amount = $2, target_date = $3 WHERE id = $4 RETURNING *',
      [title, target_amount, target_date, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tambahkan fungsi DELETE untuk Hapus
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    await pool.query('DELETE FROM wishlists WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Terhapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}