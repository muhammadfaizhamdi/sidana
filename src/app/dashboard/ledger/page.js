"use client";
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus } from 'lucide-react';
import TransactionModal from '@/components/TransactionModal';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State khusus untuk Modal Edit di halaman Ledger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', source: '', category: 'Umum', date: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions?t=' + new Date().getTime(), {
        cache: 'no-store'
      });
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
    return () => {
      window.removeEventListener('transactionUpdated', fetchData);
    };
  }, []);

  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setNewTx({
      type: tx.type,
      amount: tx.amount.toString(),
      source: tx.source,
      category: tx.category,
      date: new Date(tx.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter(tx => tx.id !== id));
        window.dispatchEvent(new Event('transactionUpdated')); // Beri sinyal ke Beranda agar saldo ikut berubah
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTx, amount: parseFloat(newTx.amount), id: editingId })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchData();
        window.dispatchEvent(new Event('transactionUpdated')); // Beri sinyal ke Beranda
      }
    } catch (error) {
      console.error("Gagal memperbarui:", error);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Filter transaksi berdasarkan pencarian
  const filteredTransactions = transactions.filter(tx => 
    tx.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 font-bold animate-pulse">Memuat Transaksi...</div>;

  return (
    <section className="space-y-6">
      
      {/* HEADER & TOMBOL TAMBAH TRANSAKSI */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Riwayat Transaksi</h2>
          <p className="text-slate-500 mt-1">Catatan komprehensif dari seluruh pergerakan cashflow Anda.</p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new Event('openTransactionModal'))} 
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={18} /> Tambah Transaksi
        </button>
      </header>

      {/* KOLOM PENCARIAN (SEARCH BAR) */}
      <div className="relative w-full md:w-1/2 mb-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Cari merchant atau kategori..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-700 font-medium shadow-sm"
        />
      </div>

      {/* TABEL TRANSAKSI RINGKAS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
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
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td className="p-4 text-sm font-bold text-slate-900">{tx.source}</td>
                <td className="p-4 text-sm text-slate-600">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                    {tx.category}
                  </span>
                </td>
                <td className={`p-4 text-sm text-right font-bold tabular-nums whitespace-nowrap ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(tx)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="Edit Data">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Hapus Data">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-medium">
            Tidak ada transaksi yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
      
      {/* Modal khusus untuk Edit Transaksi */}
      <TransactionModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        newTx={newTx} 
        setNewTx={setNewTx} 
        handleAddTransaction={handleSaveEdit} 
        editingId={editingId} 
      />
    </section>
  );
}