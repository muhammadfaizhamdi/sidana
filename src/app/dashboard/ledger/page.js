"use client";
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import TransactionModal from '@/components/TransactionModal';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State khusus untuk Modal Edit di halaman Ledger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', source: '', category: 'Umum', date: '' });

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

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) setTransactions(transactions.filter(tx => tx.id !== id));
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
        const savedTx = await res.json();
        setTransactions(transactions.map(tx => tx.id === editingId ? savedTx : tx));
        setIsModalOpen(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error("Gagal memperbarui:", error);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 font-bold animate-pulse">Memuat Transaksi...</div>;

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Riwayat Transaksi</h2>
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
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 text-sm text-slate-600">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td className="p-4 text-sm font-bold text-slate-900">{tx.source}</td>
                <td className="p-4 text-sm text-slate-600"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">{tx.category}</span></td>
                <td className={`p-4 text-sm text-right font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEditClick(tx)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="Edit Data"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Hapus Data"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal khusus untuk Edit Transaksi */}
      <TransactionModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newTx={newTx} setNewTx={setNewTx} handleAddTransaction={handleSaveEdit} editingId={editingId} />
    </section>
  );
}