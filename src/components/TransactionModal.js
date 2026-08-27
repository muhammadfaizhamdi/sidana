import React from 'react';
import { X } from 'lucide-react';

export default function TransactionModal({ isModalOpen, setIsModalOpen, newTx, setNewTx, handleAddTransaction }) {
  if (!isModalOpen) return null;

  return (
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
  );
}