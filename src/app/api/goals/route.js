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
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data target" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    
    const name = body.name;
    const target_amount = body.target_amount || body.targetAmount; 
    const current_amount = body.current_amount || body.currentAmount || 0; 
    // Menangkap data tanggal baik dari properti target_date maupun deadline
    const target_date = body.target_date || body.deadline; 

    const query = `
      INSERT INTO goals (name, target_amount, current_amount, target_date, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, target_amount, current_amount, target_date, userId];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Database API Error (POST Goals):", error); 
    return NextResponse.json({ error: "Gagal menyimpan target" }, { status: 500 });
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

    await pool.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
    return NextResponse.json({ message: "Target berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus target" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    
    const id = body.id;
    const name = body.name;
    const target_amount = body.target_amount || body.targetAmount; 
    const current_amount = body.current_amount || body.currentAmount || 0; 
    const target_date = body.target_date || body.deadline;

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    const query = `
      UPDATE goals
      SET name = $1, target_amount = $2, current_amount = $3, target_date = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *;
    `;
    const values = [name, target_amount, current_amount, target_date, id, userId];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui target" }, { status: 500 });
  }
}