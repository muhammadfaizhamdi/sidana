"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, Activity, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions?t=' + new Date().getTime(), { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('transactionUpdated', fetchData);
    return () => window.removeEventListener('transactionUpdated', fetchData);
  }, []);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  // Filter Data Khusus Bulan Ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const thisMonthTx = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const netSavings = totalIncome - totalExpense;
  
  // Kelompokkan Pengeluaran Berdasarkan Kategori
  const expensesByCategory = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  // Urutkan dari yang terbesar
  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  if (isLoading) return <div className="flex h-64 items-center justify-center font-bold text-indigo-600 animate-pulse">Menyusun Laporan Analisis...</div>;

  return (
    <section className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Analisis Keuangan</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed">
            Pantau arus kas dan kebiasaan pengeluaran Anda untuk periode <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">{monthName}</span>.
          </p>
        </div>
        <Link href="/dashboard/ledger" className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all w-full md:w-auto shrink-0">
          <Activity size={18} /> Lihat Rincian
        </Link>
      </header>

      {/* RANGKUMAN ARUS KAS (KARTU ATAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-0 opacity-50" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Pemasukan</p>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 relative z-10">{formatRupiah(totalIncome)}</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-[100px] -z-0 opacity-50" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={20} />
            </div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Pengeluaran</p>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 relative z-10">{formatRupiah(totalExpense)}</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-0 opacity-50" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">Sisa Bersih</p>
          </div>
          <p className={`text-2xl lg:text-3xl font-extrabold relative z-10 ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatRupiah(netSavings)}
          </p>
        </div>
      </div>

      {/* BREAKDOWN KATEGORI (PROGRESS BARS) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Distribusi Pengeluaran</h3>
            <p className="text-sm text-slate-500 mt-1">Pengeluaran terbesar Anda bulan ini berdasarkan kategori.</p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 items-center justify-center">
            <PieChart size={24} />
          </div>
        </div>

        {sortedCategories.length > 0 ? (
          <div className="space-y-6">
            {sortedCategories.map(([category, amount], index) => {
              const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              // Variasi warna untuk 3 kategori teratas agar terlihat premium
              const colorClass = index === 0 ? 'bg-rose-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-amber-500' : 'bg-slate-400';
              const textClass = index === 0 ? 'text-rose-600' : index === 1 ? 'text-orange-600' : index === 2 ? 'text-amber-600' : 'text-slate-600';
              const bgClass = index === 0 ? 'bg-rose-50' : index === 1 ? 'bg-orange-50' : index === 2 ? 'bg-amber-50' : 'bg-slate-50';

              return (
                <div key={category} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${bgClass} ${textClass}`}>
                        {category}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">{percent}%</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatRupiah(amount)}</span>
                  </div>
                  {/* Progress Bar Dinamis Menggunakan CSS Native */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ${colorClass}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <PieChart size={32} />
            </div>
            <p className="text-slate-500 font-medium">Belum ada pengeluaran bulan ini.</p>
          </div>
        )}
      </div>

    </section>
  );
}