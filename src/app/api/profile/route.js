import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function PUT(req) {
  try {
    // 1. Verifikasi siapa yang sedang request (hanya yang sudah login)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    // 2. Tangkap data nama dan email baru yang dikirim dari form Pengaturan
    const { name, email } = await req.json();

    // 3. Update data di database PostgreSQL
    await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, token.id]
    );

    return NextResponse.json({ message: 'Profil berhasil diperbarui' }, { status: 200 });
  } catch (error) {
    console.error("Gagal update profil:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}