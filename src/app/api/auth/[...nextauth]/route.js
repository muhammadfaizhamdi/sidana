import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Akun Sidana",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Cari user di database
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        const user = userRes.rows[0];

        if (!user) return null;

        // Cocokkan password yang diinput dengan password acak di database
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) return null;

        // Jika cocok, kembalikan data user (tanpa password)
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };