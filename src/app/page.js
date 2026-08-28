"use client";

import React, { useState, useEffect } from 'react';
// TAMBAHAN: Mengimpor ikon Edit/Pensil dari lucide-react
import { Bell, UploadCloud, Trash2, TrendingUp, Edit2, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import Sidebar from '@/components/Sidebar';
import TransactionModal from '@/components/TransactionModal';

export default function SidanaApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // TAMBAHAN: State untuk melacak apakah kita sedang dalam mode Edit
  const [editingId, setEditingId] = useState(null);

  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  // DIPERBARUI: Fungsi ini sekarang bisa Menambah (POST) sekaligus Mengedit (PUT)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.source) return;

    try {
      const isEditing = editingId !== null;
      const url = '/api/transactions';
      const method = isEditing ? 'PUT' : 'POST';
      
      const bodyData = {
        amount: parseFloat(newTx.amount),
        source: newTx.source,
        category: newTx.category,
        type: newTx.type,
        date: newTx.date
      };

      if (isEditing) bodyData.id = editingId;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const savedTx = await res.json();
        
        if (isEditing) {
          // Ganti data lama dengan data baru hasil editan di tampilan
          setTransactions(transactions.map(tx => tx.id === editingId ? savedTx : tx));
        } else {
          // Tambahkan data baru di urutan teratas
          setTransactions([savedTx, ...transactions]);
        }
        
        setIsModalOpen(false);
        setEditingId(null);
        setNewTx({ type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0] });
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter(tx => tx.id !== id));
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  // TAMBAHAN: Fungsi untuk memicu mode Edit dan mengisi form dengan data lama
  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setNewTx({
      type: tx.type,
      amount: tx.amount,
      source: tx.source,
      category: tx.category,
      date: new Date(tx.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // KALKULASI DINAMIS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const netWorth = totalIncome - totalExpense;

  const data503020 = totalIncome > 0 ? [
    { name: 'Kebutuhan (50%)', value: totalIncome * 0.5 },
    { name: 'Keinginan (30%)', value: totalIncome * 0.3 },
    { name: 'Investasi (20%)', value: totalIncome * 0.2 },
  ] : [
    { name: 'Belum Ada Pemasukan', value: 1 }
  ];
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

  const formatMoney = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const formatCompactMoney = (amount) => {
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}Jt`;
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}Rb`;
    return `Rp${amount}`;
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-indigo-600 font-bold text-xl animate-pulse">Menghubungkan ke Database...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      <Sidebar activeView={activeView} setActiveView={setActiveView} setIsModalOpen={setIsModalOpen} />

      <main className="lg:ml-64 flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
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
              <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                <div className="flex items-baseline gap-4 mt-2">
                  <h3 className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${netWorth >= 0 ? 'text-slate-900' : 'text-red-500'}`}>{formatMoney(netWorth)}</h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><TrendingUp size={16} /> Aktif</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Dihitung otomatis dari database Ledger Anda.</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => { setEditingId(null); setIsModalOpen(true); setNewTx({...newTx, type: 'income'}); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">Deposit</button>
                  <button onClick={() => { setEditingId(null); setIsModalOpen(true); setNewTx({...newTx, type: 'expense'}); }} className="bg-slate-100 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors">Catat Pengeluaran</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Strategy Status</p>
                  <div className="text-2xl font-bold text-slate-800 mt-2">On Track 🎯</div>
                </div>
                <div className="pt-4 border-t border-slate-100"><p className="text-xs text-slate-500">Alokasi dana 50/30/20 Anda bulan ini sudah optimal.</p></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-900">Aktivitas Terkini</h4>
                <button onClick={() => setActiveView('ledger')} className="text-sm text-indigo-600 hover:underline font-medium">Lihat Semua</button>
              </div>
              <div className="flex flex-col gap-3">
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-3 px-3 -mx-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-default rounded-lg">
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
        )}

        {/* SCANNER VIEW */}
        {activeView === 'scan' && (
          <section className="space-y-6 max-w-2xl mx-auto">
             <header className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Smart Scanner</h2>
                <p className="text-slate-500 mt-1">Unggah struk belanja untuk diekstrak otomatis menggunakan AI.</p>
            </header>
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4"><UploadCloud size={32} /></div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Tarik & Lepas Dokumen</h4>
              <p className="text-slate-400 mb-6 text-sm">Mendukung format JPG, PNG, PDF (Maks. 10MB)</p>
              <button onClick={() => alert("Sistem OCR sedang dalam tahap pengembangan.")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Simulate Scan</button>
            </div>
          </section>
        )}

        {/* LEDGER VIEW */}
        {activeView === 'ledger' && (
          <section className="space-y-6">
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Transaction Ledger</h2>
                <p className="text-slate-500 mt-1">Catatan komprehensif dari seluruh pergerakan cashflow Anda.</p>
              </div>
            </header>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4">Tanggal</th><th className="p-4">Merchant / Sumber</th><th className="p-4">Kategori</th><th className="p-4 text-right">Nominal</th><th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors cursor-default">
                      <td className="p-4 text-sm text-slate-600">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{tx.source}</td>
                      <td className="p-4 text-sm text-slate-600"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">{tx.category}</span></td>
                      <td className={`p-4 text-sm text-right font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(tx)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50 cursor-pointer" title="Edit Data">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer" title="Hapus Data">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <section className="space-y-6">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Analytics & Strategy</h2>
              <p className="text-slate-500 mt-1">Analisis mendalam untuk memantau kesehatan finansial Anda.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Alokasi 50/30/20</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data503020} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{data503020.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><RechartsTooltip formatter={(value) => formatMoney(value)} /></PieChart></ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Tren Cashflow</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={formatCompactMoney} width={70} /><RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => formatMoney(value)} /><Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} name="Pemasukan" /><Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Pengeluaran" /></BarChart></ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <TransactionModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        newTx={newTx} 
        setNewTx={setNewTx} 
        handleAddTransaction={handleAddTransaction} 
        editingId={editingId} 
      />
    </div>
  );
}