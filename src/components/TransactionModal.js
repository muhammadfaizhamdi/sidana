import React from 'react';
import { X } from 'lucide-react';

export default function TransactionModal({ isModalOpen, setIsModalOpen, newTx, setNewTx, handleAddTransaction, editingId }) {
  if (!isModalOpen) return null;

  // Cek apakah mode Edit aktif (jika editingId ada isinya, berarti Edit)
  const isEditing = editingId !== null && editingId !== undefined;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          {/* Judul akan berubah otomatis */}
          <h3 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h3>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-1.5 rounded-xl">
            <button type="button" onClick={() => setNewTx({...newTx, type: 'expense'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pengeluaran</button>
            <button type="button" onClick={() => setNewTx({...newTx, type: 'income'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === 'income' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pemasukan</button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
            <input type="text" inputMode="numeric" required value={newTx.amount ? new Intl.NumberFormat('id-ID').format(newTx.amount) : ''} onChange={(e) => { const rawValue = e.target.value.replace(/\./g, ''); if (!isNaN(rawValue)) { setNewTx({ ...newTx, amount: rawValue }); } }} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-300 placeholder:font-normal" placeholder="Contoh: 50.000" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sumber / Merchant</label>
            <input type="text" required value={newTx.source} onChange={(e) => setNewTx({...newTx, source: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-300" placeholder="Contoh: Indomaret, Gaji Bulanan" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
              <select value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all appearance-none bg-white">
                <option>Umum</option>
                <option>Makanan</option>
                <option>Transport</option>
                <option>Belanja</option>
                <option>Tagihan</option>
                <option>Investasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
              <input type="date" required value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <div className="pt-2">
            {/* Tombol akan berubah otomatis */}
            <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98]">
              {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}