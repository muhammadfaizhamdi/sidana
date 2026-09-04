"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TransactionModal from '@/components/TransactionModal';
import { LayoutDashboard, Receipt, ScanLine, PieChart, Star, Activity, Settings } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

  // --- LISTENER UNTUK MEMBUKA MODAL DARI HALAMAN MANA SAJA ---
  useEffect(() => {
    const openModal = () => setIsModalOpen(true);
    window.addEventListener('openTransactionModal', openModal);
    
    return () => {
      window.removeEventListener('openTransactionModal', openModal);
    };
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTx, amount: parseFloat(newTx.amount) })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTx({ type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0] });
        
        window.dispatchEvent(new Event('transactionUpdated'));
        router.refresh(); 
      }
    } catch (error) { console.error("Gagal menyimpan:", error); }
  };

  const MobileNavItem = ({ href, icon, isCenter, label }) => {
    const isActive = pathname === href;
    if (isCenter) {
      return (
        <div className="relative -top-6">
          <Link href={href} className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 border-4 border-white hover:scale-105 active:scale-95 transition-transform">
            {icon}
          </Link>
        </div>
      );
    }
    return (
      <Link href={href} className={`flex flex-col items-center justify-center p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}>
        {icon}
        <span className="text-[10px] font-bold mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative pb-20 lg:pb-0 overflow-x-hidden">
      <Sidebar setIsModalOpen={setIsModalOpen} />
      
      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen w-full">
        {/* HEADER MOBILE (Menampung Logo, Analytics, dan Pengaturan) */}
        <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 fixed top-0 left-0 w-full z-50 px-5 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Sidana.
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/analytics" className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Analytics">
              <Activity size={22} />
            </Link>
            <Link href="/dashboard/settings" className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Pengaturan">
              <Settings size={22} />
            </Link>
          </div>
        </header>

        <div className="flex-1 p-5 pt-24 pb-28 lg:p-10 lg:pt-10 lg:pb-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION MOBILE (Prioritas 5 Fitur Utama) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-2 flex justify-around items-end z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pt-2">
        <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={24} />} label="Beranda" />
        <MobileNavItem href="/dashboard/ledger" icon={<Receipt size={24} />} label="Riwayat" />
        <MobileNavItem href="/dashboard/scan" icon={<ScanLine size={24} />} isCenter={true} />
        <MobileNavItem href="/dashboard/budget" icon={<PieChart size={24} />} label="Anggaran" />
        <MobileNavItem href="/dashboard/wishlist" icon={<Star size={24} />} label="Wishlist" />
      </nav>

      <TransactionModal 
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} 
        newTx={newTx} setNewTx={setNewTx} 
        handleAddTransaction={handleAddTransaction} editingId={null} 
      />
    </div>
  );
}