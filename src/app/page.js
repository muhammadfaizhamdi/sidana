"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, Receipt, ScanLine, PieChart as PieChartIcon, 
  Plus, Bell, UploadCloud, Trash2, TrendingUp, X 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function SidanaApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Data Transaksi
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2026-08-27', category: 'Makanan & Minuman', source: 'Superindo', amount: 215000, type: 'expense' },
    { id: 2, date: '2026-08-26', category: 'Gaji', source: 'PT Teknologi Indo', amount: 15000000, type: 'income' },
    { id: 3, date: '2026-08-25', category: 'Transportasi', source: 'Gojek', amount: 45000, type: 'expense' },
  ]);

  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.source) return;

    const transaction = {
      id: Date.now(),
      date: newTx.date,
      category: newTx.category,
      source: newTx.source,
      amount: parseFloat(newTx.amount),
      type: newTx.type
    };

    setTransactions([transaction, ...transactions]);
    setIsModalOpen(false);
    setNewTx({ type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalIncome - totalExpense;

  const data503020 = [
    { name: 'Kebutuhan (50%)', value: 7500000 },
    { name: 'Keinginan (30%)', value: 4500000 },
    { name: 'Investasi (20%)', value: 3000000 },
  ];
  const COLORS = ['#4f46e5', '#38bdf8', '#10b981'];

  const monthlyData = [
    { name: 'Mei', Pemasukan: 12000000, Pengeluaran: 8500000 },
    { name: 'Jun', Pemasukan: 15000000, Pengeluaran: 9200000 },
    { name: 'Jul', Pemasukan: 15000000, Pengeluaran: 8800000 },
    { name: 'Agt', Pemasukan: 16500000, Pengeluaran: 7500000 },
  ];

  const formatMoney = (amount) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  const formatCompactMoney = (amount) => {
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}Jt`;
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}Rb`;
    return `Rp${amount}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 p-6 fixed h-full z-40 shadow-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Sidana.
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Institutional Grade</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <NavButton id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="ledger" icon={<Receipt size={20} />} label="Ledger" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="scan" icon={<ScanLine size={20} />} label="Smart Scanner" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="analytics" icon={<PieChartIcon size={20} />} label="Analytics" activeView={activeView} setActiveView={setActiveView} />
        </nav>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <Plus size={18} /> Tambah Transaksi
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="lg:ml-64 flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <section className="space-y-6">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h2>
                <p className="text-slate-500 mt-1">Selamat datang kembali, pantau status finansial Anda secara real-time.</p>
              </div>
              <button 
                onClick={() => alert("Fitur notifikasi akan segera dihubungkan ke database.")}
                className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Bell size={20} className="text-slate-600" />
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                <div className="flex items-baseline gap-4 mt-2">
                  <h3 className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${netWorth >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                    {formatMoney(netWorth)}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <TrendingUp size={16} /> Aktif
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Dihitung otomatis dari kalkulasi Ledger Anda.</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => { setIsModalOpen(true); setNewTx({...newTx, type: 'income'}); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">Deposit</button>
                  <button onClick={() => { setIsModalOpen(true); setNewTx({...newTx, type: 'expense'}); }} className="bg-slate-100 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors">Catat Pengeluaran</button>
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
                <button onClick={() => setActiveView('ledger')} className="text-sm text-indigo-600 hover:underline font-medium">Lihat Semua</button>
              </div>
              <div className="flex flex-col gap-3">
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                        {tx.source.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{tx.source}</p>
                        <p className="text-xs text-slate-400">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                    </p>
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
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px] transition-all hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Tarik & Lepas Dokumen</h4>
              <p className="text-slate-400 mb-6 text-sm">Mendukung format JPG, PNG, PDF (Maks. 10MB)</p>
              <button 
                onClick={() => alert("Fitur OCR akan diaktifkan setelah integrasi backend selesai.")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                Simulate Scan
              </button>
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
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Merchant / Sumber</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4 text-right">Nominal</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm text-slate-600">{tx.date}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{tx.source}</td>
                      <td className="p-4 text-sm text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`p-4 text-sm text-right font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">Belum ada data. Silakan tambah transaksi baru.</td></tr>
                  )}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data503020} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {data503020.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
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
        )}
      </main>

      {/* NEW TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Tambah Transaksi</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-5">
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setNewTx({...newTx, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newTx.type === 'expense' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setNewTx({...newTx, type: 'income'})} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newTx.type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>Pemasukan</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nominal (Rp)</label>
                <input required type="number" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-semibold" placeholder="Contoh: 150000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Merchant / Sumber</label>
                <input required type="text" value={newTx.source} onChange={(e) => setNewTx({...newTx, source: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="mis. Tokopedia, Gaji Kantor" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                  <select value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white">
                    <option>Makanan & Minuman</option>
                    <option>Transportasi</option>
                    <option>Belanja</option>
                    <option>Tagihan & Utilitas</option>
                    <option>Gaji</option>
                    <option>Investasi</option>
                    <option>Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                  <input required type="date" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 mt-2">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function NavButton({ id, icon, label, activeView, setActiveView }) {
  const isActive = activeView === id;
  return (
    <button 
      onClick={() => setActiveView(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left
        ${isActive ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon} {label}
    </button>
  );
}