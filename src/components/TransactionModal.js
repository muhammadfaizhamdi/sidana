"use client";
import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function TransactionModal({ 
  isModalOpen, setIsModalOpen, newTx, setNewTx, handleAddTransaction, editingId 
}) {
  const [displayAmount, setDisplayAmount] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch Kategori Budget dari Database secara Real-time
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/budgets?t=' + new Date().getTime(), { cache: 'no-store' });
        const data = await res.json();
        setCategories(data);
        
        // Auto-select kategori pertama jika form baru dibuka dan belum ada kategori
        if (!editingId && data.length > 0 && !newTx.category) {
          setNewTx(prev => ({ ...prev, category: data.find(c => c.group_type === 'needs')?.name || data[0].name }));
        }
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    if (isModalOpen) fetchCategories();
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && newTx.amount) {
      setDisplayAmount(formatRupiah(newTx.amount.toString()));
    } else if (!isModalOpen && !editingId) {
      setDisplayAmount('');
    }
  }, [isModalOpen, newTx.amount, editingId]);

  if (!isModalOpen) return null;

  const formatRupiah = (value) => {
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, '');
    setDisplayAmount(formatRupiah(rawValue));
    setNewTx({ ...newTx, amount: rawValue });
  };

  const needs = categories.filter(c => c.group_type === 'needs');
  const wants = categories.filter(c => c.group_type === 'wants');
  const savings = categories.filter(c => c.group_type === 'savings');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <header className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? 'Edit Transaksi' : 'Catat Transaksi'}
          </h2>
          <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
          
          <div className="flex gap-3 p-1 bg-slate-100 rounded-2xl">
            <button type="button" onClick={() => setNewTx({ ...newTx, type: 'expense' })} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${newTx.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <ArrowDownCircle size={18} /> Pengeluaran
            </button>
            <button type="button" onClick={() => setNewTx({ ...newTx, type: 'income' })} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${newTx.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <ArrowUpCircle size={18} /> Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
              <input type="text" inputMode="numeric" required value={displayAmount} onChange={handleAmountChange} placeholder="0" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-bold text-lg text-slate-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sumber / Catatan</label>
            <input type="text" required value={newTx.source} onChange={(e) => setNewTx({ ...newTx, source: e.target.value })} placeholder="Cth: Nasi Goreng / Gaji" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* DROPDOWN KATEGORI 50/30/20 DINAMIS */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori Budget</label>
              <select required value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium text-sm">
                
                {newTx.type === 'expense' ? (
                  <>
                    <optgroup label="Needs (50% Kebutuhan)">
                      {needs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </optgroup>
                    <optgroup label="Wants (30% Keinginan)">
                      {wants.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </optgroup>
                    <optgroup label="Savings (20% Tabungan)">
                      {savings.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </optgroup>
                  </>
                ) : (
                  // Kategori Pemasukan
                  <>
                    <option value="Gaji">Gaji / Upah</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Pemberian">Pemberian</option>
                    <option value="Hasil Investasi">Hasil Investasi</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
              <input type="date" required value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
              {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}