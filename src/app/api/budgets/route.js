import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM budgets ORDER BY group_type ASC, name ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, group_type, monthly_limit } = await req.json();
    const result = await pool.query(
      'INSERT INTO budgets (name, group_type, monthly_limit) VALUES ($1, $2, $3) RETURNING *',
      [name, group_type, monthly_limit]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name, group_type, monthly_limit } = await req.json();
    const result = await pool.query(
      'UPDATE budgets SET name = $1, group_type = $2, monthly_limit = $3 WHERE id = $4 RETURNING *',
      [name, group_type, monthly_limit, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    await pool.query('DELETE FROM budgets WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Terhapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}