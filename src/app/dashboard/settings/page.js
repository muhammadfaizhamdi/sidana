"use client";
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [isUSD, setIsUSD] = useState(false);

  useEffect(() => {
    // Membaca status pilihan dari local storage agar tersimpan permanen
    const stored = localStorage.getItem('sidana_isUSD');
    if (stored === 'true') setIsUSD(true);
  }, []);

  const toggleCurrency = () => {
    const newValue = !isUSD;
    setIsUSD(newValue);
    localStorage.setItem('sidana_isUSD', newValue.toString());
  };

  return (
    <section className="space-y-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Pengaturan</h2>
        <p className="text-slate-500 mt-1 text-sm">Sesuaikan preferensi dan konfigurasi aplikasi Anda.</p>
      </header>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Preferensi Umum</h3>
          <p className="text-sm text-slate-500 mt-1">Atur format tampilan dan mata uang standar.</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-base">Tampilkan dalam US Dollar (USD)</p>
              <p className="text-sm text-slate-500 mt-1">Konversi seluruh nominal uang ke USD secara real-time.</p>
            </div>
            <button 
              onClick={toggleCurrency} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${isUSD ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isUSD ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}