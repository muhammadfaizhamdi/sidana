"use client";
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, X } from 'lucide-react';

export default function SettingsPage() {
  const [isUSD, setIsUSD] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // State untuk Profil
  const [profile, setProfile] = useState({ name: 'Pengguna Sidana', email: 'user@sidana.com' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', email: '' });

  useEffect(() => {
    // Muat semua preferensi dari Local Storage saat komponen dipasang
    if (localStorage.getItem('sidana_isUSD') === 'true') setIsUSD(true);
    if (localStorage.getItem('sidana_theme') === 'dark') setIsDark(true);
    
    const savedName = localStorage.getItem('sidana_user_name');
    const savedEmail = localStorage.getItem('sidana_user_email');
    if (savedName || savedEmail) {
      setProfile({
        name: savedName || 'Pengguna Sidana',
        email: savedEmail || 'user@sidana.com'
      });
    }
  }, []);

  const toggleCurrency = () => {
    const newValue = !isUSD;
    setIsUSD(newValue);
    localStorage.setItem('sidana_isUSD', newValue.toString());
    window.location.reload();
  };

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('sidana_theme', newValue ? 'dark' : 'light');
    
    // Menambahkan/menghapus class 'dark' di elemen paling luar <html>
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();

      if (!data || data.length === 0) {
        alert("Tidak ada data transaksi untuk diekspor.");
        setIsExporting(false);
        return;
      }

      // 1. Buat Header Kolom CSV
      let csvContent = "Tanggal,Tipe,Kategori,Sumber/Merchant,Nominal\n";

      // 2. Isi Baris CSV
      data.forEach(tx => {
        const date = new Date(tx.date).toLocaleDateString('id-ID');
        const type = tx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
        const source = `"${tx.source.replace(/"/g, '""')}"`; // Mencegah error koma di nama merchant
        csvContent += `${date},${type},${tx.category},${source},${tx.amount}\n`;
      });

      // 3. Buat File Blob dan paksa unduh
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Riwayat_Transaksi_Sidana_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Gagal mengekspor data:", error);
      alert("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  const openProfileModal = () => {
    setEditProfileData(profile);
    setIsProfileModalOpen(true);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('sidana_user_name', editProfileData.name);
    localStorage.setItem('sidana_user_email', editProfileData.email);
    setProfile(editProfileData);
    setIsProfileModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.replace('/');
  };

  return (
    <section className="space-y-6">
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan</h2>
        <p className="text-slate-500 mt-1 text-sm">Sesuaikan preferensi dan konfigurasi aplikasi Anda.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Preferensi Umum</h3>
              <p className="text-sm text-slate-500 mt-1">Atur format tampilan dan preferensi visual standar.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 text-base">Tampilkan dalam US Dollar (USD)</p>
                  <p className="text-sm text-slate-500 mt-1">Konversi seluruh nominal uang ke USD secara real-time.</p>
                </div>
                <button 
                  onClick={toggleCurrency} 
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${isUSD ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isUSD ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 text-base">Mode Gelap (Dark Mode)</p>
                  <p className="text-sm text-slate-500 mt-1">Ubah antarmuka menjadi mode gelap.</p>
                </div>
                <button 
                  onClick={toggleDarkMode} 
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${isDark ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Akun & Data</h3>
              <p className="text-sm text-slate-500 mt-1">Kelola data transaksi dan akses akun Anda.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 text-base">Ekspor Data (CSV)</p>
                  <p className="text-sm text-slate-500 mt-1">Unduh seluruh riwayat transaksi untuk dibuka di Excel.</p>
                </div>
                <button 
                  onClick={handleExportCSV} 
                  disabled={isExporting}
                  className={`px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors shrink-0 text-sm flex items-center justify-center gap-2 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isExporting ? <><Loader2 size={16} className="animate-spin" /> Mengekspor...</> : 'Ekspor Data'}
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="lg:hidden w-full flex items-center justify-center py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 hover:bg-rose-100 active:scale-95 transition-all">
            Keluar dari Aplikasi
          </button>

        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 uppercase">
              {profile.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">{profile.email}</p>
            <button onClick={openProfileModal} className="w-full py-2.5 font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-sm">
              Edit Profil
            </button>
          </div>
        </div>
        
      </div>

      {/* MODAL EDIT PROFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <header className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Profil</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={saveProfile} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Tampilan</label>
                <input 
                  type="text" required 
                  value={editProfileData.name} 
                  onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                <input 
                  type="email" required 
                  value={editProfileData.email} 
                  onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 font-medium" 
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}