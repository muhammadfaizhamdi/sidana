"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '@/components/GlobalProvider';

export default function DashboardOverview() {
  const { formatMoney } = useGlobalContext(); // Tarik fungsi format uang dari pusat
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
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
    
    fetchTransactions();
    window.addEventListener('transactionUpdated', fetchTransactions);
    return () => window.removeEventListener('transactionUpdated', fetchTransactions);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const netWorth = totalIncome - totalExpense;

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">Memuat Ringkasan...</div>;

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">Ringkasan Keuangan</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-500">Pantau status finansial Anda secara real-time.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Link href="/dashboard/analytics" className="hidden sm:flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            Lihat Analisis
          </Link>
          <button onClick={() => window.dispatchEvent(new Event('openTransactionModal'))} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0">
            <Plus size={18} /> Tambah Transaksi
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kekayaan Bersih</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
              {formatMoney(netWorth)}
            </h3>
            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp size={14} /> Aktif
            </span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Dihitung otomatis dari riwayat transaksi Anda.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors duration-500">
          <div>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status Strategi</p>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mt-2">On Track 🎯</div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">Alokasi dana 50/30/20 Anda bulan ini sudah optimal.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Aktivitas Terkini</h4>
          <Link href="/dashboard/ledger" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Lihat Riwayat</Link>
        </div>
        <div className="flex flex-col gap-3">
          {transactions.slice(0, 3).map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-3 px-3 -mx-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold">{tx.source.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{tx.source}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <p className={`font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada aktivitas transaksi.</p>}
        </div>
      </div>
    </section>
  );
}