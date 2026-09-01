"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

export default function WishlistPage() {
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', target_date: '' });
  const [isLoading, setIsLoading] = useState(true);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch('/api/goals');
        const data = await res.json();
        setGoals(data);
      } catch (error) {
        console.error("Gagal mengambil data goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date) return;
    try {
      const rawAmount = newGoal.target_amount.toString().replace(/\./g, '');
      const isEditing = editingGoalId !== null;
      const method = isEditing ? 'PUT' : 'POST';

      const bodyData = {
        name: newGoal.name,
        target_amount: parseFloat(rawAmount),
        target_date: newGoal.target_date
      };

      if (isEditing) bodyData.id = editingGoalId;

      const res = await fetch('/api/goals', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const savedGoal = await res.json();
        if (isEditing) {
          setGoals(goals.map(g => g.id === editingGoalId ? savedGoal : g));
        } else {
          setGoals([...goals, savedGoal]);
        }
        setNewGoal({ name: '', target_amount: '', target_date: '' });
        setEditingGoalId(null);
      }
    } catch (error) {
      console.error("Gagal menyimpan target:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Yakin ingin menghapus target impian ini?")) return;
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error("Gagal menghapus target:", error);
    }
  };

  const handleEditGoalClick = (goal) => {
    const cleanAmount = parseInt(goal.target_amount, 10);
    const dateObj = new Date(goal.target_date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    
    setEditingGoalId(goal.id);
    setNewGoal({
      name: goal.name,
      target_amount: cleanAmount,
      target_date: `${yyyy}-${mm}-${dd}`
    });
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-indigo-600 font-bold animate-pulse">Memuat Target Impian...</div>;

  return (
    <section className="space-y-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Smart Savings Goal</h2>
        <p className="text-slate-500 mt-1 text-sm">Hitung otomatis tabungan bulanan untuk mewujudkan wishlist Anda.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingGoalId ? 'Perbarui Target' : 'Buat Target Baru'}</h3>
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Impian</label>
              <input type="text" required value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none placeholder:text-slate-300" placeholder="Contoh: MacBook M3" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Harga (Rp)</label>
              <input type="text" inputMode="numeric" required value={newGoal.target_amount ? new Intl.NumberFormat('id-ID').format(newGoal.target_amount) : ''} onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); if(!isNaN(raw)) setNewGoal({...newGoal, target_amount: raw}) }} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-600 outline-none placeholder:text-slate-300" placeholder="Contoh: 15.000.000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenggat Waktu</label>
              <input type="date" required value={newGoal.target_date} onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer" />
            </div>
            <div className="pt-2 flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
                {editingGoalId ? 'Perbarui Target' : 'Simpan Target'}
              </button>
              {editingGoalId && (
                <button type="button" onClick={() => { setEditingGoalId(null); setNewGoal({ name: '', target_amount: '', target_date: '' }); }} className="bg-slate-100 text-slate-600 rounded-xl px-4 py-3 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          {goals.map(goal => {
            const today = new Date();
            const targetDate = new Date(goal.target_date);
            let monthDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
            if (monthDiff <= 0) monthDiff = 1; 
            const monthlyNeeded = goal.target_amount / monthDiff;
            
            return (
              <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-indigo-100 transition-colors">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-slate-900">{goal.name}</h4>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditGoalClick(goal)} className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-1" title="Edit Target">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1" title="Hapus Target">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Tenggat: <span className="font-semibold text-slate-700">{targetDate.toLocaleDateString('id-ID', {month: 'long', year: 'numeric'})}</span> <span className="text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded ml-1">{monthDiff} bulan lagi</span></p>
                  <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisihkan per bulan:</p>
                    <p className="text-lg font-extrabold text-indigo-600">{formatMoney(monthlyNeeded)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
              <p className="text-slate-500 font-bold text-lg">Belum ada target impian.</p>
              <p className="text-sm text-slate-400 mt-1">Mulai rencanakan masa depan Anda sekarang.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}