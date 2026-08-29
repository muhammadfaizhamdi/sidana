import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Cek apakah email sudah pernah terdaftar
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // 2. Acak (Hash) password menggunakan Bcrypt (Standar Industri)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan pengguna baru ke database
    const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email';
    const values = [name, email, hashedPassword];
    
    const result = await pool.query(query, values);
    
    return NextResponse.json({ message: "Registrasi berhasil", user: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Registrasi Error:", error);
    return NextResponse.json({ error: "Gagal melakukan registrasi" }, { status: 500 });
  }
}