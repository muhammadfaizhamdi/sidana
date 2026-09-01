"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TransactionModal from '@/components/TransactionModal';
import { LayoutDashboard, Receipt, ScanLine, Target, User, Plus } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

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
        router.refresh(); 
      }
    } catch (error) { console.error("Gagal menyimpan:", error); }
  };

  const MobileNavItem = ({ href, icon, isCenter }) => {
    const isActive = pathname === href;
    if (isCenter) {
      return (
        <Link href={href} className="flex flex-col items-center justify-center -mt-6">
          <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
            {icon}
          </div>
        </Link>
      );
    }
    return (
      <Link href={href} className={`flex flex-col items-center justify-center p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
        {icon}
      </Link>
    );
  };

  return (
    // Penambahan overflow-x-hidden untuk mencegah background hitam (kebocoran layar horizontal) di HP
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative pb-20 lg:pb-0 overflow-x-hidden">
      <Sidebar setIsModalOpen={setIsModalOpen} />
      
      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen w-full">
        {/* HEADER MOBILE (Wajib pakai fixed top-0 left-0 w-full z-50 agar mutlak terkunci) */}
        <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 fixed top-0 left-0 w-full z-50 px-5 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Sidana
          </h1>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
            <Plus size={18} /> Catat
          </button>
        </header>

        {/* KONTEN UTAMA (Wajib ada pt-24 agar tidak tertutup header & pb-28 agar tidak tertutup menu bawah) */}
        <div className="flex-1 p-5 pt-24 pb-28 lg:p-10 lg:pt-10 lg:pb-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION MOBILE */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-end z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={24} />} />
        <MobileNavItem href="/dashboard/ledger" icon={<Receipt size={24} />} />
        <MobileNavItem href="/dashboard/scan" icon={<ScanLine size={28} />} isCenter={true} />
        <MobileNavItem href="/dashboard/wishlist" icon={<Target size={24} />} />
        <MobileNavItem href="/dashboard/settings" icon={<User size={24} />} />
      </nav>

      <TransactionModal 
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} 
        newTx={newTx} setNewTx={setNewTx} 
        handleAddTransaction={handleAddTransaction} editingId={null} 
      />
    </div>
  );
}