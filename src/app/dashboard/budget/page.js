"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, AlertCircle, Edit2, Trash2, Wallet, X, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { useGlobalContext } from '@/components/GlobalProvider';

export default function BudgetPage() {
  const { formatMoney } = useGlobalContext();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [activeGroupType, setActiveGroupType] = useState('needs');
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetFormData, setBudgetFormData] = useState({ name: '', monthly_limit: '' });

  const [isColdStart, setIsColdStart] = useState(false);
  const [inputTargetIncome, setInputTargetIncome] = useState('');
  const [savedTargetIncome, setSavedTargetIncome] = useState(0);

  const hasAutoSeeded = useRef(false);

  const fetchData = async () => {
    try {
      const [budgetsRes, txRes] = await Promise.all([
        fetch('/api/budgets?t=' + new Date().getTime(), { cache: 'no-store' }),
        fetch('/api/transactions?t=' + new Date().getTime(), { cache: 'no-store' })
      ]);
      const bData = await budgetsRes.json();
      const tData = await txRes.json();
      setBudgets(Array.isArray(bData) ? bData : []);
      setTransactions(Array.isArray(tData) ? tData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const localTarget = localStorage.getItem('targetIncome');
    if (localTarget) setSavedTargetIncome(parseFloat(localTarget));
    window.addEventListener('transactionUpdated', fetchData);
    return () => window.removeEventListener('transactionUpdated', fetchData);
  }, []);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeBudgets = Array.isArray(budgets) ? budgets : [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Mengambil SEMUA transaksi di bulan ini
  const currentMonthTx = safeTransactions.filter(t => 
    new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear
  );

  const thisMonthIncomes = currentMonthTx.filter(t => t.type === 'income');
  const thisMonthIncomeTotal = thisMonthIncomes.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  useEffect(() => {
    if (!isLoading) setIsColdStart(thisMonthIncomeTotal === 0 && savedTargetIncome === 0);
  }, [isLoading, thisMonthIncomeTotal, savedTargetIncome]);

  const activeIncome = thisMonthIncomeTotal > 0 ? thisMonthIncomeTotal : savedTargetIncome;
  
  const ruleLimits = { 
    needs: Math.round(activeIncome * 0.50), 
    wants: Math.round(activeIncome * 0.30), 
    savings: Math.round(activeIncome * 0.20) 
  };

  const thisMonthExpenses = currentMonthTx.filter(t => t.type === 'expense');
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const unspentFunds = Math.max(0, activeIncome - totalSpentThisMonth);
  
  // 5 Transaksi Terakhir untuk fitur "Quick Undo"
  const recentTransactions = [...currentMonthTx].sort((a, b) => b.id - a.id).slice(0, 5);

  useEffect(() => {
    if (!isLoading && safeBudgets.length === 0 && activeIncome > 0 && !hasAutoSeeded.current) {
      hasAutoSeeded.current = true; 
      const seedDefaultBudgets = async () => {
        const defaultBudgets = [
          { name: 'Makan & Minum', group_type: 'needs', monthly_limit: Math.round(activeIncome * 0.25) },
          { name: 'Kos / Kontrakan', group_type: 'needs', monthly_limit: Math.round(activeIncome * 0.15) },
          { name: 'Transportasi', group_type: 'needs', monthly_limit: Math.round(activeIncome * 0.10) },
          { name: 'Hiburan', group_type: 'wants', monthly_limit: Math.round(activeIncome * 0.20) },
          { name: 'Belanja Pribadi', group_type: 'wants', monthly_limit: Math.round(activeIncome * 0.10) },
          { name: 'Tabungan Utama', group_type: 'savings', monthly_limit: Math.round(activeIncome * 0.15) },
          { name: 'Dana Darurat', group_type: 'savings', monthly_limit: Math.round(activeIncome * 0.05) }
        ];
        try {
          await fetch('/api/budgets', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(defaultBudgets) 
          });
          fetchData(); 
        } catch (error) { console.error("Gagal auto-seed:", error); }
      };
      seedDefaultBudgets();
    }
  }, [isLoading, safeBudgets.length, activeIncome]);

  const formatInputRupiah = (value) => value.replace(/[^,\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handleSaveTargetIncome = (e) => {
    e.preventDefault();
    const rawAmount = inputTargetIncome.replace(/\./g, '');
    localStorage.setItem('targetIncome', rawAmount);
    setSavedTargetIncome(parseFloat(rawAmount));
    setIsColdStart(false);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const rawAmount = budgetFormData.monthly_limit.replace(/\./g, '');
    const payload = { name: budgetFormData.name, group_type: activeGroupType, monthly_limit: parseFloat(rawAmount) };
    try {
      if (modalMode === 'edit') {
        payload.id = editingBudget.id;
        await fetch('/api/budgets', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setIsBudgetModalOpen(false); fetchData(); 
    } catch (error) { console.error("Gagal simpan anggaran:", error); }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori anggaran ini?")) return;
    try { await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' }); fetchData(); } catch (error) { console.error("Gagal menghapus:", error); }
  };

  // FITUR QUICK UNDO: Menghapus transaksi yang salah input langsung dari halaman Anggaran
  const handleDeleteTx = async (id) => {
    if (!window.confirm("Batalkan transaksi ini? Saldo Anda akan otomatis kembali.")) return;
    try {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      fetchData();
      window.dispatchEvent(new Event('transactionUpdated'));
    } catch (error) {
      console.error("Gagal membatalkan transaksi:", error);
    }
  };

  const openAddModal = (groupType) => {
    setModalMode('add'); setActiveGroupType(groupType); setBudgetFormData({ name: '', monthly_limit: '' }); setIsBudgetModalOpen(true);
  };

  const openEditModal = (budget) => {
    setModalMode('edit'); setActiveGroupType(budget.group_type); setEditingBudget(budget);
    const roundedLimit = Math.round(parseFloat(budget.monthly_limit || 0));
    setBudgetFormData({ name: budget.name, monthly_limit: formatInputRupiah(roundedLimit.toString()) });
    setIsBudgetModalOpen(true);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">Memuat Anggaran...</div>;

  if (isColdStart) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center px-4">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors"><PieChart size={40} /></div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 transition-colors">Selamat Datang di Anggaran!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">Sistem belum mendeteksi riwayat pemasukan Anda. Untuk membuat batas aman <span className="font-bold text-indigo-600 dark:text-indigo-400">50/30/20</span> secara otomatis, berapa target atau perkiraan pemasukan bulanan Anda?</p>
        <form onSubmit={handleSaveTargetIncome} className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100/50 dark:shadow-none transition-colors duration-500">
          <div className="relative mb-6 text-left">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xl">Rp</span>
            <input type="text" required value={inputTargetIncome} onChange={e => setInputTargetIncome(formatInputRupiah(e.target.value))} className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-3xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="0" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg shadow-lg shadow-indigo-200 dark:shadow-none">Lanjutkan <ArrowRight size={20} /></button>
        </form>
      </div>
    );
  }

  const renderBudgetGroup = (groupType, title, colorClass, bgClass, baselineAmount) => {
    const groupBudgets = safeBudgets.filter(b => b.group_type === groupType);
    const totalAllocated = groupBudgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
    const difference = Math.round(baselineAmount) - Math.round(totalAllocated);
    
    const isPerfect = Math.abs(difference) <= 100 && groupBudgets.length > 0;
    const isOverBudget = difference < -100;
    
    const darkColorClass = colorClass === 'text-indigo-600' ? 'dark:text-indigo-400' : colorClass === 'text-orange-600' ? 'dark:text-orange-400' : 'dark:text-emerald-400';

    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col mb-6 hover:shadow-md transition-all duration-500">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
              <button onClick={() => openAddModal(groupType)} className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"><Plus size={14} /> Kategori</button>
            </div>
            
            <div className="mt-2">
              {isPerfect ? (
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} /> Alokasi 100% Pas
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {groupType === 'savings' ? 'Target Minimal:' : 'Batas Ideal:'} <span className={`font-bold ${colorClass} ${darkColorClass}`}>{formatMoney(baselineAmount)}</span>
                  </p>
                  {difference > 0 && groupType !== 'savings' && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-1">💡 Anda masih bisa mengalokasikan Rp {formatMoney(difference)} lagi.</p>
                  )}
                  {difference > 0 && groupType === 'savings' && (
                    <p className="text-xs text-amber-500 dark:text-amber-400 font-medium mt-1">⚠ Alokasi Anda kurang Rp {formatMoney(difference)} dari target aman.</p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="sm:text-right">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Limit Diset</p>
            <p className={`text-2xl font-extrabold ${isOverBudget && groupType !== 'savings' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{formatMoney(totalAllocated)}</p>
          </div>
        </header>

        {isOverBudget && groupType !== 'savings' && (
          <div className="flex items-start gap-3 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl mb-6 border border-rose-100 dark:border-rose-500/20">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed"><span className="font-bold block mb-0.5">Peringatan Overbudget!</span>Total setelan limit Anda melebihi batas ideal 50/30/20 sebesar {formatMoney(Math.abs(difference))}. Kurangi limit kategori.</div>
          </div>
        )}

        {groupBudgets.length === 0 ? (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">Belum ada kategori anggaran di kelompok ini.</div>
        ) : (
          <div className="space-y-6">
            {groupBudgets.map(budget => {
              const limit = parseFloat(budget.monthly_limit || 0);
              const spent = currentMonthTx.filter(t => t.type === 'expense' && t.category === budget.name).reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
              const percentUsed = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isDanger = percentUsed >= 90 && limit > 0;

              return (
                <div key={budget.id} className="group relative">
                  <div className="flex justify-between items-end mb-2.5">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-none mb-1.5">{budget.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Terpakai {formatMoney(spent)} dari <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(limit)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(budget)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all" title="Edit Kategori"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all" title="Hapus Kategori"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : bgClass}`} style={{ width: `${percentUsed}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">Perencana Anggaran</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl leading-relaxed transition-colors duration-500">
            Rincian setelan batas pengeluaran Anda.
          </p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new Event('openTransactionModal'))} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={18} /> Tambah Transaksi
        </button>
      </header>

      {/* 1. PERUBAHAN WARNA KOTAK SALDO MENJADI SLATE/HITAM PEKAT */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500 ${unspentFunds > 0 ? 'bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none dark:bg-black dark:border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white'}`}>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">
            Sisa Saldo Tersedia
          </h3>
          <p className="text-sm mt-1 opacity-90">
            {unspentFunds > 0 
              ? 'Sisa uang riil Anda bulan ini. Gunakan untuk pengeluaran sehari-hari atau setorkan ke Wishlist sebelum bulan berganti.' 
              : 'Saldo Anda telah habis terpakai bulan ini.'}
          </p>
        </div>
        <div className="text-3xl font-black shrink-0">
          {formatMoney(unspentFunds)}
        </div>
      </div>
      
      {renderBudgetGroup('needs', 'Kebutuhan Pokok (Maks 50%)', 'text-indigo-600', 'bg-indigo-500', ruleLimits.needs)}
      {renderBudgetGroup('wants', 'Keinginan Bebas (Maks 30%)', 'text-orange-600', 'bg-orange-500', ruleLimits.wants)}
      {renderBudgetGroup('savings', 'Tabungan & Cicilan (Min 20%)', 'text-emerald-600', 'bg-emerald-500', ruleLimits.savings)}

      {/* 2. FITUR QUICK UNDO: TRANSAKSI TERKINI */}
      {recentTransactions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm mt-8">
          <header className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas Terkini</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">5 transaksi terakhir Anda bulan ini. Hapus jika terjadi kesalahan input.</p>
          </header>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.source}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold text-sm tabular-nums ${tx.type === 'expense' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                  </span>
                  <button onClick={() => handleDeleteTx(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all" title="Batalkan Transaksi">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{modalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveBudget} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Kategori</label>
                <input type="text" required value={budgetFormData.name} onChange={e => setBudgetFormData({...budgetFormData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Cth: Belanja Dapur" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Batas Pengeluaran Bulanan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-lg">Rp</span>
                  <input type="text" required value={budgetFormData.monthly_limit} onChange={e => setBudgetFormData({...budgetFormData, monthly_limit: formatInputRupiah(e.target.value)})} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="0" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg"><Wallet size={20} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}