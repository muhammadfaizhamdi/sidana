"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieIcon } from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '@/components/GlobalProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AnalyticsPage() {
  const { formatMoney } = useGlobalContext();
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
  
  const expensesByCategory = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  // Persiapan data dan warna untuk Donut Chart
  const chartData = sortedCategories.map(([name, value]) => ({ name, value }));
  const COLORS = ['#f43f5e', '#f97316', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#64748b'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-bold text-slate-900 dark:text-white mb-1">{payload[0].name}</p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {formatMoney(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">Menyusun Laporan Analisis...</div>;

  return (
    <section className="space-y-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">Analisis Keuangan</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-lg leading-relaxed transition-colors duration-500">
            Pantau arus kas dan kebiasaan pengeluaran Anda untuk periode <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">{monthName}</span>.
          </p>
        </div>
        <Link href="/dashboard/ledger" className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all w-full md:w-auto shrink-0">
          <Activity size={18} /> Lihat Rincian
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/5 rounded-bl-[100px] -z-0 opacity-50 transition-colors" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"><TrendingUp size={20} /></div>
            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Pemasukan</p>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white relative z-10 transition-colors">{formatMoney(totalIncome)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 dark:bg-rose-500/5 rounded-bl-[100px] -z-0 opacity-50 transition-colors" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors"><TrendingDown size={20} /></div>
            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Pengeluaran</p>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white relative z-10 transition-colors">{formatMoney(totalExpense)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/5 rounded-bl-[100px] -z-0 opacity-50 transition-colors" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"><BarChart3 size={20} /></div>
            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Sisa Bersih</p>
          </div>
          <p className={`text-2xl lg:text-3xl font-extrabold relative z-10 transition-colors ${netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatMoney(netSavings)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Distribusi Pengeluaran</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Pengeluaran terbesar Anda bulan ini berdasarkan kategori.</p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 items-center justify-center transition-colors">
            <PieIcon size={24} />
          </div>
        </div>

        {sortedCategories.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            
            {/* Bagian Kiri: Donut Chart Interaktif */}
            <div className="w-full lg:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bagian Kanan: Daftar Rincian Progress */}
            <div className="w-full lg:w-1/2 space-y-5">
              {sortedCategories.map(([category, amount], index) => {
                const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                const colorHex = COLORS[index % COLORS.length];

                return (
                  <div key={category} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors">
                          {category}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium ml-1">{percent}%</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white transition-colors">{formatMoney(amount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden transition-colors">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${percent}%`, backgroundColor: colorHex }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 text-slate-300 dark:text-slate-500 rounded-full flex items-center justify-center mb-4 transition-colors"><PieIcon size={32} /></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Belum ada pengeluaran bulan ini.</p>
          </div>
        )}
      </div>

    </section>
  );
}