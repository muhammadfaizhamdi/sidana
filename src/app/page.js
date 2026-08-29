import Link from 'next/link';
import { ArrowRight, ShieldCheck, LineChart, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1">
            Sidana<span className="text-indigo-600">.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-8">
          <ShieldCheck size={16} /> Keamanan Standar Institusi
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight mb-6">
          Kelola Arus Kas Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Presisi Tinggi.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium">
          Sidana menghadirkan arsitektur manajemen finansial kelas atas. Pantau transaksi, hitung target tabungan, dan capai kebebasan finansial tanpa antarmuka yang membingungkan.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
            Buat Akun Sekarang <ArrowRight size={20} />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <LineChart size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Analisis Real-time</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Dashboard interaktif yang menampilkan metrik pendapatan dan pengeluaran secara instan.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Savings</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Kalkulasi otomatis alokasi dana bulanan untuk memastikan barang impian Anda tercapai tepat waktu.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Privasi Absolut</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Infrastruktur database independen. Data finansial Anda sepenuhnya terenkripsi dan menjadi milik Anda.</p>
          </div>
        </div>
      </main>
    </div>
  );
}