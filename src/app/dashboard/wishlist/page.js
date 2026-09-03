"use client";
import React, { useState, useEffect } from 'react';
import { Star, Plus, AlertCircle, CheckCircle2, Wallet, X, Edit2, Trash2, Calendar } from 'lucide-react';

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newWishlist, setNewWishlist] = useState({ title: '', target_amount: '', target_date: '' });
  const [depositData, setDepositData] = useState({ id: null, amount: '', title: '' });

  const fetchData = async () => {
    try {
      const [wishRes, txRes] = await Promise.all([
        fetch('/api/wishlist?t=' + new Date().getTime(), { cache: 'no-store' }),
        fetch('/api/transactions?t=' + new Date().getTime(), { cache: 'no-store' })
      ]);
      setWishlists(await wishRes.json());
      setTransactions(await txRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('transactionUpdated', fetchData);
    return () => window.removeEventListener('transactionUpdated', fetchData);
  }, []);

  const incomes = transactions.filter(t => t.type === 'income');
  let monthsActive = 1;
  if (incomes.length > 0) {
    const firstDate = new Date(Math.min(...incomes.map(t => new Date(t.date))));
    const today = new Date();
    monthsActive = (today.getFullYear() - firstDate.getFullYear()) * 12 + (today.getMonth() - firstDate.getMonth()) + 1;
  }
  const avgMonthlyIncome = incomes.reduce((sum, t) => sum + parseFloat(t.amount), 0) / (monthsActive || 1);
  const safeLimit20Percent = avgMonthlyIncome * 0.20;

  const getRemainingMonths = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return diff > 0 ? diff : 1; 
  };

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  const formatInputRupiah = (value) => value.replace(/[^,\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handleSaveWishlist = async (e) => {
    e.preventDefault();
    const rawAmount = newWishlist.target_amount.replace(/\./g, '');
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = { ...newWishlist, target_amount: parseFloat(rawAmount) };
    if (editingId) bodyData.id = editingId;

    await fetch('/api/wishlist', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    
    setIsAddModalOpen(false);
    setNewWishlist({ title: '', target_amount: '', target_date: '' });
    setEditingId(null);
    fetchData();
  };

  const handleEditClick = (wish) => {
    setEditingId(wish.id);
    const dateObj = new Date(wish.target_date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    
    setNewWishlist({
      title: wish.title,
      target_amount: formatInputRupiah(wish.target_amount.toString()),
      target_date: `${yyyy}-${mm}-${dd}`
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Yakin ingin menghapus target impian ini? (Dana terkumpul akan tetap ada di riwayat).")) return;
    await fetch(`/api/wishlist?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const rawAmount = depositData.amount.replace(/\./g, '');
    const parsedAmount = parseFloat(rawAmount);

    try {
      // 1. Tembak API Wishlist untuk menambah progress bar
      await fetch(`/api/wishlist/${depositData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount })
      });

      // 2. Tembak API Transaksi secara otomatis (Pasti Berhasil!)
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: parsedAmount,
          source: `Tabungan: ${depositData.title}`,
          category: 'Investasi',
          date: new Date().toISOString().split('T')[0] // Tanggal hari ini
        })
      });

      // 3. Tutup Modal & Sebarkan Sinyal ke Beranda
      setIsDepositModalOpen(false);
      setDepositData({ id: null, amount: '', title: '' });
      window.dispatchEvent(new Event('transactionUpdated'));
      fetchData();
    } catch (error) {
      console.error("Gagal memproses setoran:", error);
    }
  };

  const openDepositModal = (wish, recommendedAmount) => {
    setDepositData({ id: wish.id, title: wish.title, amount: formatInputRupiah(Math.round(recommendedAmount).toString()) });
    setIsDepositModalOpen(true);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center font-bold text-indigo-600 animate-pulse">Memuat Smart Plan...</div>;

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Target Finansial</h2>
          <p className="text-slate-500 mt-1 text-sm">Sistem menyarankan tabungan maksimal <span className="font-bold text-indigo-600">{formatRupiah(safeLimit20Percent)}</span> (20% pemasukan).</p>
        </div>
        <button onClick={() => { setEditingId(null); setNewWishlist({ title: '', target_amount: '', target_date: '' }); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors shrink-0">
          <Plus size={18} /> Target Baru
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {wishlists.map(wish => {
          const target = parseFloat(wish.target_amount);
          const collected = parseFloat(wish.collected_amount);
          const isAchieved = collected >= target;
          const remainingAmount = target - collected;
          const remainingMonths = getRemainingMonths(wish.target_date);
          const recommendedMonthly = remainingAmount / remainingMonths;
          const isWarning = recommendedMonthly > safeLimit20Percent && !isAchieved;
          const progressPercent = Math.min((collected / target) * 100, 100);

          return (
            <div key={wish.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-indigo-200 transition-colors">
              {isAchieved && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAchieved ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {isAchieved ? <CheckCircle2 size={20} /> : <Star size={20} className={!isAchieved ? "fill-indigo-100" : ""} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{wish.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5">
                      <Calendar size={12} />
                      <span>{new Date(wish.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                  <button onClick={() => handleEditClick(wish)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(wish.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatRupiah(target)}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-500">Terkumpul {formatRupiah(collected)}</span>
                  <span className="font-bold text-indigo-600">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${isAchieved ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                {!isAchieved ? (
                  <>
                    {isWarning ? (
                      <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl mb-4 text-xs font-medium border border-rose-100">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>Tabungan <b>{formatRupiah(recommendedMonthly)}/bln</b> melebihi batas aman 20%.</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">Saran setoran:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(recommendedMonthly)}</span>
                      </div>
                    )}
                    
                    <button onClick={() => openDepositModal(wish, isWarning ? safeLimit20Percent : recommendedMonthly)} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                      <Wallet size={16} /> Setor Tabungan
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2.5 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100 flex justify-center items-center gap-2">
                    <CheckCircle2 size={16} /> Target Tercapai!
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {wishlists.length === 0 && (
          <div className="col-span-full py-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Star size={32} className="fill-indigo-100" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada target impian</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Mulai rencanakan masa depan keuangan Anda dengan menabung secara rutin.
            </p>
            <button onClick={() => { setEditingId(null); setNewWishlist({ title: '', target_amount: '', target_date: '' }); setIsAddModalOpen(true); }} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={18} /> Buat Target Pertama
            </button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Target' : 'Target Baru'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveWishlist} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Impian</label>
                <input type="text" required value={newWishlist.title} onChange={e => setNewWishlist({...newWishlist, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1.5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-slate-900" placeholder="Cth: Kamera Mirrorless" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Target (Rp)</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input type="text" required value={newWishlist.target_amount} onChange={e => setNewWishlist({...newWishlist, target_amount: formatInputRupiah(e.target.value)})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Tercapai Pada</label>
                <input type="date" required value={newWishlist.target_date} onChange={e => setNewWishlist({...newWishlist, target_date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1.5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all">
                  {editingId ? 'Simpan Perubahan' : 'Buat Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-slate-900">Setor Tabungan</h3>
              <button onClick={() => setIsDepositModalOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Alokasi dana untuk target <span className="font-bold text-slate-900">{depositData.title}</span></p>
            <form onSubmit={handleDeposit}>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">Rp</span>
                <input type="text" required value={depositData.amount} onChange={e => setDepositData({...depositData, amount: formatInputRupiah(e.target.value)})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                <Wallet size={18} /> Pindahkan Dana
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}