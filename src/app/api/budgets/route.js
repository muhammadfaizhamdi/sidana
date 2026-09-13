import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await pool.query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY id ASC', [token.id]);
    return NextResponse.json(res.rows, { status: 200 });
  } catch (error) {
    console.error("GET Budgets Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // JIKA SISTEM MELAKUKAN AUTO-ISI (BANYAK KATEGORI SEKALIGUS)
    if (Array.isArray(body)) {
      const insertPromises = body.map(b => 
        pool.query(
          'INSERT INTO budgets (user_id, name, group_type, monthly_limit) VALUES ($1, $2, $3, $4) RETURNING *',
          [token.id, b.name, b.group_type, b.monthly_limit]
        )
      );
      const inserted = await Promise.all(insertPromises);
      return NextResponse.json(inserted.map(r => r.rows[0]), { status: 201 });
    }

    // JIKA USER MENAMBAHKAN MANUAL (1 KATEGORI)
    const res = await pool.query(
      'INSERT INTO budgets (user_id, name, group_type, monthly_limit) VALUES ($1, $2, $3, $4) RETURNING *',
      [token.id, body.name, body.group_type, body.monthly_limit]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST Budgets Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, name, group_type, monthly_limit } = await req.json();

    const res = await pool.query(
      'UPDATE budgets SET name = $1, group_type = $2, monthly_limit = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, group_type, monthly_limit, id, token.id]
    );
    return NextResponse.json(res.rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await pool.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [id, token.id]);
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}