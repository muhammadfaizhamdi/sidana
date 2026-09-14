export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    const result = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 ORDER BY target_date ASC', [session.user.id]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    const { title, target_amount, target_date } = await req.json();
    const result = await pool.query(
      'INSERT INTO wishlists (user_id, title, target_amount, target_date, collected_amount) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [session.user.id, title, target_amount, target_date]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const { id, title, target_amount, target_date } = await req.json();
    
    // 1. Tarik nama impian yang lama sebelum diubah
    const oldWish = await pool.query('SELECT title FROM wishlists WHERE id = $1 AND user_id = $2', [id, session.user.id]);
    const oldTitle = oldWish.rows[0]?.title;

    // 2. Update target impian
    const result = await pool.query(
      'UPDATE wishlists SET title = $1, target_amount = $2, target_date = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, target_amount, target_date, id, session.user.id]
    );

    // 3. SINKRONISASI: Jika nama diubah, ubah juga seluruh nama transaksi di Ledger/Anggaran!
    if (oldTitle && oldTitle !== title) {
      await pool.query(
        'UPDATE transactions SET source = $1 WHERE source = $2 AND user_id = $3',
        [`Tabungan: ${title}`, `Tabungan: ${oldTitle}`, session.user.id]
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const id = new URL(req.url).searchParams.get('id');

    // 1. Tarik nama impian untuk menghapus riwayat transaksinya
    const wishRes = await pool.query('SELECT title FROM wishlists WHERE id = $1 AND user_id = $2', [id, session.user.id]);
    
    if (wishRes.rows.length > 0) {
      const title = wishRes.rows[0].title;
      // 2. SINKRONISASI: Hapus semua transaksi pengeluaran (uang kembali) yang nyangkut di nama ini
      await pool.query('DELETE FROM transactions WHERE source = $1 AND user_id = $2', [`Tabungan: ${title}`, session.user.id]);
      // 3. Hapus target impiannya
      await pool.query('DELETE FROM wishlists WHERE id = $1 AND user_id = $2', [id, session.user.id]);
    }
    return NextResponse.json({ message: 'Terhapus beserta seluruh riwayatnya' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}