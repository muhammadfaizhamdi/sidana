"use client";
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus } from 'lucide-react';
import TransactionModal from '@/components/TransactionModal';
import { useGlobalContext } from '@/components/GlobalProvider';

export default function LedgerPage() {
  const { formatMoney } = useGlobalContext();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', source: '', category: 'Umum', date: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions?t=' + new Date().getTime(), { cache: 'no-store' });
      setTransactions(await res.json());
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

  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setNewTx({
      type: tx.type, amount: tx.amount.toString(), source: tx.source, category: tx.category, date: new Date(tx.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter(tx => tx.id !== id));
        window.dispatchEvent(new Event('transactionUpdated'));
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTx, amount: parseFloat(newTx.amount), id: editingId })
      });
      if (res.ok) {
        setIsModalOpen(false); setEditingId(null); fetchData(); window.dispatchEvent(new Event('transactionUpdated'));
      }
    } catch (error) {
      console.error("Gagal memperbarui:", error);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.source.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">Memuat Transaksi...</div>;

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-500">Riwayat Transaksi</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-500">Catatan komprehensif dari seluruh pergerakan cashflow Anda.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new Event('openTransactionModal'))} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0">
          <Plus size={18} /> Tambah Transaksi
        </button>
      </header>

      <div className="relative w-full md:w-1/2 mb-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Search size={18} /></span>
        <input type="text" placeholder="Cari merchant atau kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-700 dark:text-white font-medium shadow-sm" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto transition-colors duration-500">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold transition-colors duration-500">
              <th className="p-4">Tanggal</th>
              <th className="p-4">Merchant / Sumber</th>
              <th className="p-4">Kategori</th>
              <th className="p-4 text-right">Nominal</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">{tx.source}</td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors">{tx.category}</span>
                </td>
                <td className={`p-4 text-sm text-right font-bold tabular-nums whitespace-nowrap ${tx.type === 'expense' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(tx)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/20" title="Edit Data"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(tx.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-rose-500/20" title="Hapus Data"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">Tidak ada transaksi yang cocok dengan pencarian Anda.</div>}
      </div>
      
      <TransactionModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newTx={newTx} setNewTx={setNewTx} handleAddTransaction={handleSaveEdit} editingId={editingId} />
    </section>
  );
}