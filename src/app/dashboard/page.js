"use client";
import React, { useState, useEffect } from 'react';
import { Bell, UploadCloud, Trash2, TrendingUp, Edit2, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '@/components/Sidebar';
import TransactionModal from '@/components/TransactionModal';

export default function SidanaApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Transaksi
  const [editingId, setEditingId] = useState(null);
  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

  // State untuk Preferensi
  const [isUSD, setIsUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(15500);
  
  // State untuk Target Impian (Goals)
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', target_date: '' });

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) setExchangeRate(data.rates.IDR);
      } catch (error) {
        console.error("Gagal mengambil kurs:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      console.error("Gagal mengambil data goals:", error);
    }
  };

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
          setTransactions(transactions.map(tx => tx.id === editingId ? savedTx : tx));
        } else {
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

  // FUNGSI BARU: Menyimpan & Memperbarui Target Impian
  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date) return;
    try {
      const rawAmount = newGoal.target_amount.toString().replace(/\./g, '');
      const isEditing = editingGoalId !== null;
      const method = isEditing ? 'PUT' : 'POST';

      const bodyData = {
        name: newGoal.name,
        target_amount: parseFloat(rawAmount),
        target_date: newGoal.target_date
      };

      if (isEditing) bodyData.id = editingGoalId;

      const res = await fetch('/api/goals', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const savedGoal = await res.json();
        if (isEditing) {
          setGoals(goals.map(g => g.id === editingGoalId ? savedGoal : g));
        } else {
          setGoals([...goals, savedGoal]);
        }
        setNewGoal({ name: '', target_amount: '', target_date: '' });
        setEditingGoalId(null);
      }
    } catch (error) {
      console.error("Gagal menyimpan target:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Yakin ingin menghapus target impian ini?")) return;
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error("Gagal menghapus target:", error);
    }
  };

  // FUNGSI BARU: Membuka mode edit target (Sudah Diperbaiki)
  const handleEditGoalClick = (goal) => {
    // 1. Buang angka desimal bawaan database agar tidak ikut terhapus oleh filter
    const cleanAmount = parseInt(goal.target_amount, 10);
    
    // 2. Ambil tanggal sesuai zona waktu lokal (WIB), cegah pemaksaan ke zona waktu UTC
    const dateObj = new Date(goal.target_date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;

    setEditingGoalId(goal.id);
    setNewGoal({
      name: goal.name,
      target_amount: cleanAmount,
      target_date: localDate
    });
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const netWorth = totalIncome - totalExpense;

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

  const formatMoney = (amount) => {
    if (isUSD) {
      const usdAmount = amount / exchangeRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdAmount);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

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
        
        {/* VIEW: DASHBOARD */}
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
              <div className="col-span-1 md:col-span-2 bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                <div className="flex items-baseline gap-4 mt-2">
                  <h3 className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${netWorth >= 0 ? 'text-slate-900' : 'text-red-500'}`}>{formatMoney(netWorth)}</h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><TrendingUp size={16} /> Aktif</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Dihitung otomatis dari database Ledger Anda.</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => { setEditingId(null); setIsModalOpen(true); setNewTx({...newTx, type: 'income'}); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer">Deposit</button>
                  <button onClick={() => { setEditingId(null); setIsModalOpen(true); setNewTx({...newTx, type: 'expense'}); }} className="bg-slate-100 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors cursor-pointer">Catat Pengeluaran</button>
                </div>
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
                <button onClick={() => setActiveView('ledger')} className="text-sm text-indigo-600 hover:underline font-medium cursor-pointer">Lihat Semua</button>
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

        {/* VIEW: SCANNER */}
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
              <button onClick={() => alert("Sistem OCR sedang dalam tahap pengembangan.")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors cursor-pointer">Simulate Scan</button>
            </div>
          </section>
        )}

        {/* VIEW: LEDGER */}
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
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors cursor-default group">
                      <td className="p-4 text-sm text-slate-600">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{tx.source}</td>
                      <td className="p-4 text-sm text-slate-600"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">{tx.category}</span></td>
                      <td className={`p-4 text-sm text-right font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(tx)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50 cursor-pointer" title="Edit Data"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer" title="Hapus Data"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VIEW: ANALYTICS */}
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

        {/* VIEW: GOALS (WISHLIST) */}
        {activeView === 'goals' && (
          <section className="space-y-6">
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Smart Savings Goal</h2>
              <p className="text-slate-500 mt-1 text-sm">Hitung otomatis tabungan bulanan untuk mewujudkan wishlist Anda.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Tambah/Edit Target */}
              <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{editingGoalId ? 'Perbarui Target' : 'Buat Target Baru'}</h3>
                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Impian</label>
                    <input type="text" required value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none placeholder:text-slate-300" placeholder="Contoh: MacBook M3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Harga (Rp)</label>
                    <input type="text" inputMode="numeric" required value={newGoal.target_amount ? new Intl.NumberFormat('id-ID').format(newGoal.target_amount) : ''} onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); if(!isNaN(raw)) setNewGoal({...newGoal, target_amount: raw}) }} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 outline-none placeholder:text-slate-300" placeholder="Contoh: 15.000.000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenggat Waktu</label>
                    <input type="date" required value={newGoal.target_date} onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
                      {editingGoalId ? 'Perbarui Target' : 'Simpan Target'}
                    </button>
                    {editingGoalId && (
                      <button type="button" onClick={() => { setEditingGoalId(null); setNewGoal({ name: '', target_amount: '', target_date: '' }); }} className="bg-slate-100 text-slate-600 rounded-xl px-4 py-3 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Daftar Target */}
              <div className="col-span-1 lg:col-span-2 space-y-4">
                {goals.map(goal => {
                  const today = new Date();
                  const targetDate = new Date(goal.target_date);
                  let monthDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
                  if (monthDiff <= 0) monthDiff = 1; 
                  const monthlyNeeded = goal.target_amount / monthDiff;
                  
                  return (
                    <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-indigo-100 transition-colors">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-bold text-slate-900">{goal.name}</h4>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditGoalClick(goal)} className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-1" title="Edit Target">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1" title="Hapus Target">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Tenggat: <span className="font-semibold text-slate-700">{targetDate.toLocaleDateString('id-ID', {month: 'long', year: 'numeric'})}</span> <span className="text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded ml-1">{monthDiff} bulan lagi</span></p>
                        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisihkan per bulan:</p>
                          <p className="text-lg font-extrabold text-indigo-600">{formatMoney(monthlyNeeded)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
                    <p className="text-slate-500 font-bold text-lg">Belum ada target impian.</p>
                    <p className="text-sm text-slate-400 mt-1">Mulai rencanakan masa depan Anda sekarang.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: SETTINGS */}
        {activeView === 'settings' && (
          <section className="space-y-6">
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Pengaturan</h2>
              <p className="text-slate-500 mt-1 text-sm">Sesuaikan preferensi dan konfigurasi aplikasi Anda.</p>
            </header>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Preferensi Umum</h3>
                <p className="text-sm text-slate-500 mt-1">Atur format tampilan dan mata uang standar.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-base">Tampilkan dalam US Dollar (USD)</p>
                    <p className="text-sm text-slate-500 mt-1">Konversi seluruh nominal uang ke USD secara real-time.</p>
                  </div>
                  <button 
                    onClick={() => setIsUSD(!isUSD)} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${isUSD ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isUSD ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      <TransactionModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newTx={newTx} setNewTx={setNewTx} handleAddTransaction={handleAddTransaction} editingId={editingId} />
    </div>
  );
}