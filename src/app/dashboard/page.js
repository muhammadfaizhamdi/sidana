"use client";
import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUSD, setIsUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(15500);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.rates?.IDR) setExchangeRate(data.rates.IDR);
      } catch (error) {
        console.error("Gagal mengambil kurs:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const netWorth = totalIncome - totalExpense;

  const formatMoney = (amount) => {
    if (isUSD) {
      const usdAmount = amount / exchangeRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdAmount);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 font-bold animate-pulse">Memuat Data Overview...</div>;

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h2>
          <p className="text-slate-500 mt-1">Selamat datang kembali, pantau status finansial Anda secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert("Notifikasi sistem aktif.")} className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <Bell size={20} className="text-slate-600" />
          </button>
          <button onClick={() => alert("Menu Profil")} className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm cursor-pointer">
            <User size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
          <div className="flex items-baseline gap-4 mt-2">
            <h3 className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${netWorth >= 0 ? 'text-slate-900' : 'text-red-500'}`}>{formatMoney(netWorth)}</h3>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><TrendingUp size={16} /> Aktif</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">Dihitung otomatis dari database Ledger Anda.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Strategy Status</p>
            <div className="text-2xl font-bold text-slate-800 mt-2">On Track 🎯</div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">Alokasi dana 50/30/20 Anda bulan ini sudah optimal.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-slate-900">Aktivitas Terkini</h4>
          <Link href="/dashboard/ledger" className="text-sm text-indigo-600 hover:underline font-medium">Lihat Semua di Ledger</Link>
        </div>
        <div className="flex flex-col gap-3">
          {transactions.slice(0, 3).map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-3 px-3 -mx-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">{tx.source.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-slate-900">{tx.source}</p>
                  <p className="text-xs text-slate-400">{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <p className={`font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-slate-500 text-center py-4">Belum ada aktivitas transaksi.</p>}
        </div>
      </div>
    </section>
  );
}