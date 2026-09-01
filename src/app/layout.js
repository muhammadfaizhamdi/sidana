import './globals.css'; // Pastikan CSS global dipanggil di sini

export const metadata = {
  title: 'Sidana | Manajemen Keuangan',
  description: 'Aplikasi pencatatan keuangan personal yang profesional.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}