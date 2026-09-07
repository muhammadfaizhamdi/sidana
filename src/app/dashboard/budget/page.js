"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, AlertCircle, Edit2, Wallet, X, ArrowRight } from 'lucide-react';
import { useGlobalContext } from '@/components/GlobalProvider';

export default function BudgetPage() {
  const { formatMoney } = useGlobalContext();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newLimit, setNewLimit] = useState('');

  const [isColdStart, setIsColdStart] = useState(false);
  const [inputTargetIncome, setInputTargetIncome] = useState('');
  const [savedTargetIncome, setSavedTargetIncome] = useState(0);

  const fetchData = async () => {
    try {
      const [budgetsRes, txRes] = await Promise.all([
        fetch('/api/budgets?t=' + new Date().getTime(), { cache: 'no-store' }),
        fetch('/api/transactions?t=' + new Date().getTime(), { cache: 'no-store' })
      ]);
      setBudgets(await budgetsRes.json());
      setTransactions(await txRes.json());
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

  const incomes = transactions.filter(t => t.type === 'income');
  let avgIncome = 0;
  if (incomes.length > 0) {
    const firstDate = new Date(Math.min(...incomes.map(t => new Date(t.date))));
    const monthsActive = Math.max(1, (new Date().getFullYear() - firstDate.getFullYear()) * 12 + (new Date().getMonth() - firstDate.getMonth()) + 1);
    avgIncome = incomes.reduce((sum, t) => sum + parseFloat(t.amount), 0) / monthsActive;
  }

  useEffect(() => {
    if (!isLoading) {
      setIsColdStart(avgIncome === 0 && savedTargetIncome === 0);
    }
  }, [isLoading, avgIncome, savedTargetIncome]);

  const activeIncome = avgIncome > 0 ? avgIncome : savedTargetIncome;

  const ruleLimits = { needs: activeIncome * 0.50, wants: activeIncome * 0.30, savings: activeIncome * 0.20 };
  
  // Mempertahankan pemisah titik saat mengetik di input box manual
  const formatInputRupiah = (value) => value.replace(/[^,\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handleSaveTargetIncome = (e) => {
    e.preventDefault();
    const rawAmount = inputTargetIncome.replace(/\./g, '');
    localStorage.setItem('targetIncome', rawAmount);
    setSavedTargetIncome(parseFloat(rawAmount));
    setIsColdStart(false);
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    const rawAmount = newLimit.replace(/\./g, '');
    await fetch('/api/budgets', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingBudget.id, name: editingBudget.name, group_type: editingBudget.group_type, monthly_limit: parseFloat(rawAmount) })
    });
    setIsEditModalOpen(false); fetchData();
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget); setNewLimit(formatInputRupiah(budget.monthly_limit.toString())); setIsEditModalOpen(true);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">Menghitung Anggaran...</div>;

  if (isColdStart) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center px-4">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors"><PieChart size={40} /></div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 transition-colors">Selamat Datang di Anggaran!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">Sistem belum mendeteksi riwayat pemasukan Anda. Untuk membuat batas aman <span className="font-bold text-indigo-600 dark:text-indigo-400">50/30/20</span> secara otomatis, berapa target atau perkiraan pemasukan bulanan Anda?</p>
        <form onSubmit={handleSaveTargetIncome} className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100/50 dark:shadow-none transition-colors duration-500">
          <div className="relative mb-6 text-left">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xl">Rp</span>
            <input type="text" required value={inputTargetIncome} onChange={e => setInputTargetIncome(formatInputRupiah(e.target.value))} className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-3xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="0" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg shadow-lg shadow-indigo-200 dark:shadow-none">Mulai Buat Anggaran <ArrowRight size={20} /></button>
        </form>
      </div>
    );
  }

  const renderBudgetGroup = (groupType, title, colorClass, bgClass, maxLimit) => {
    const groupBudgets = budgets.filter(b => b.group_type === groupType);
    const totalAllocated = groupBudgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit), 0);
    const isOverBudget = totalAllocated > maxLimit;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTx = transactions.filter(t => new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear);

    const darkColorClass = colorClass === 'text-indigo-600' ? 'dark:text-indigo-400' : colorClass === 'text-orange-600' ? 'dark:text-orange-400' : 'dark:text-emerald-400';

    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col mb-6 hover:shadow-md transition-all duration-500">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Batas aman porsi Anda: <span className={`font-bold ${colorClass} ${darkColorClass}`}>{formatMoney(maxLimit)}</span></p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Jatah Kategori Ini</p>
            <p className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{formatMoney(totalAllocated)}</p>
          </div>
        </header>

        {isOverBudget && (
          <div className="flex items-start gap-3 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl mb-6 border border-rose-100 dark:border-rose-500/20">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed"><span className="font-bold block mb-0.5">Peringatan Anggaran Berlebih!</span>Total jatah Anda melebihi porsi ideal. Anda berisiko defisit bulan ini jika menghabiskan semuanya.</div>
          </div>
        )}

        <div className="space-y-6">
          {groupBudgets.map(budget => {
            const limit = parseFloat(budget.monthly_limit);
            const spent = thisMonthTx.filter(t => t.type === 'expense' && t.category === budget.name).reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const percentUsed = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isDanger = percentUsed >= 90;

            return (
              <div key={budget.id} className="group relative">
                <div className="flex justify-between items-end mb-2.5">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-none mb-1.5">{budget.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Terpakai {formatMoney(spent)} dari <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(limit)}</span></p>
                  </div>
                  <button onClick={() => openEditModal(budget)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all sm:opacity-0 group-hover:opacity-100"><Edit2 size={18} /></button>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className={`h-3 rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : bgClass}`} style={{ width: `${percentUsed}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-8">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">Perencana Anggaran</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl leading-relaxed transition-colors duration-500">
          {avgIncome > 0 ? `Berdasarkan riwayat pemasukan riil Anda (${formatMoney(activeIncome)}/bln), berikut adalah batas aman 50/30/20 Anda.` : `Menggunakan target pemasukan manual Anda sebesar ${formatMoney(activeIncome)}. Catat pemasukan riil agar hitungan menjadi otomatis.`}
        </p>
      </header>
      {renderBudgetGroup('needs', 'Kebutuhan Pokok (50%)', 'text-indigo-600', 'bg-indigo-500', ruleLimits.needs)}
      {renderBudgetGroup('wants', 'Keinginan Bebas (30%)', 'text-orange-600', 'bg-orange-500', ruleLimits.wants)}
      {renderBudgetGroup('savings', 'Tabungan & Cicilan (20%)', 'text-emerald-600', 'bg-emerald-500', ruleLimits.savings)}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Atur Jatah</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Batas maksimal pengeluaran bulan ini untuk <span className="font-bold text-slate-900 dark:text-white">{editingBudget?.name}</span>.</p>
            <form onSubmit={handleUpdateLimit}>
              <div className="relative mb-8">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xl">Rp</span>
                <input type="text" required value={newLimit} onChange={e => setNewLimit(formatInputRupiah(e.target.value))} className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-3xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
              </div>
              <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg"><Wallet size={20} /> Simpan Anggaran</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}