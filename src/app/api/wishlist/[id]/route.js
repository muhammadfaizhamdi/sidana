import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const { amount } = await req.json();
    
    // Hanya fokus menambahkan uang ke progress Wishlist
    const wishResult = await pool.query(
      'UPDATE wishlists SET collected_amount = collected_amount + $1 WHERE id = $2 RETURNING *',
      [parseFloat(amount), id]
    );
    
    return NextResponse.json(wishResult.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}