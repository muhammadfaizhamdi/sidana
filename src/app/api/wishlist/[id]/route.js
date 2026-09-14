import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { amount } = await req.json();
    
    const wishResult = await pool.query(
      'UPDATE wishlists SET collected_amount = collected_amount + $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [parseFloat(amount), id, session.user.id]
    );
    
    return NextResponse.json(wishResult.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}