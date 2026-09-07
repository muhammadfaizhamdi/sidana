import './globals.css'; // Pastikan CSS global dipanggil di sini
import GlobalProvider from '@/components/GlobalProvider';

export const metadata = {
  title: 'Sidana | Manajemen Keuangan',
  description: 'Aplikasi pencatatan keuangan personal yang profesional.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}