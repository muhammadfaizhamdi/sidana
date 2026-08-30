// BARIS UNTUK MEMATIKAN CACHE (Wajib ada di paling atas)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const userId = session.user.id;
    
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    const { amount, source, category, type, date } = body;

    const query = `
      INSERT INTO transactions (amount, source, category, type, date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [amount, source, category, type, date, userId];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = session.user.id;

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    const { id, amount, source, category, type, date } = body;

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    const query = `
      UPDATE transactions
      SET amount = $1, source = $2, category = $3, type = $4, date = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *;
    `;
    const values = [amount, source, category, type, date, id, userId];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui" }, { status: 500 });
  }
}