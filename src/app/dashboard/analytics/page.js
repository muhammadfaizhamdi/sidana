"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => { setTransactions(data); setIsLoading(false); })
      .catch(console.error);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  
  const data503020 = totalIncome > 0 ? [
    { name: 'Kebutuhan (50%)', value: totalIncome * 0.5 },
    { name: 'Keinginan (30%)', value: totalIncome * 0.3 },
    { name: 'Investasi (20%)', value: totalIncome * 0.2 },
  ] : [{ name: 'Belum Ada Pemasukan', value: 1 }];
  
  const COLORS = ['#4f46e5', '#38bdf8', '#10b981'];

  const getMonthlyData = () => {
    const grouped = {};
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedTransactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleDateString('id-ID', { month: 'short' });
      if (!grouped[month]) grouped[month] = { name: month, Pemasukan: 0, Pengeluaran: 0 };
      const amount = parseFloat(tx.amount);
      if (tx.type === 'income') grouped[month].Pemasukan += amount;
      if (tx.type === 'expense') grouped[month].Pengeluaran += amount;
    });
    return Object.values(grouped);
  };
  
  const monthlyData = getMonthlyData();

  const formatMoney = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatCompactMoney = (amount) => {
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}Jt`;
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}Rb`;
    return `Rp${amount}`;
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 font-bold animate-pulse">Memuat Analisis...</div>;

  return (
    <section className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Analisis & Strategi</h2>
        <p className="text-slate-500 mt-1">Analisis mendalam untuk memantau kesehatan finansial Anda.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Alokasi 50/30/20</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data503020} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data503020.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(value) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tren Cashflow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={formatCompactMoney} width={70} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => formatMoney(value)} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}