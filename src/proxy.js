import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Menggunakan export default sesuai standar Next.js 16 untuk proxy
export default async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Aturan 1: Jika user belum login dan mencoba masuk ke area /dashboard, tendang ke /login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Aturan 2: Jika user SUDAH login dan mencoba membuka halaman depan/login, tarik ke /dashboard
  if ((pathname === '/login' || pathname === '/register' || pathname === '/') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login', 
    '/register', 
    '/'
  ],
};