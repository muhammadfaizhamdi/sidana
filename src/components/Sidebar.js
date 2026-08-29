"use client";
import React from 'react';
import { LayoutDashboard, Receipt, ScanLine, PieChart as PieChartIcon, Settings, Target, Plus, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Sidebar({ activeView, setActiveView, setIsModalOpen }) {
  const NavButton = ({ id, icon, label }) => {
    const isActive = activeView === id;
    return (
      <button
        onClick={() => setActiveView(id)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left cursor-pointer ${
          isActive ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        {icon} {label}
      </button>
    );
  };

  return (
    <aside className="w-64 hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 p-6 fixed h-full z-40 shadow-sm">
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
          Sidana.
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Institutional Grade</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavButton id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavButton id="ledger" icon={<Receipt size={20} />} label="Ledger" />
        <NavButton id="scan" icon={<ScanLine size={20} />} label="Smart Scanner" />
        <NavButton id="analytics" icon={<PieChartIcon size={20} />} label="Analytics" />
        <NavButton id="goals" icon={<Target size={20} />} label="Wishlist" />
        <NavButton id="settings" icon={<Settings size={20} />} label="Pengaturan" />
      </nav>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer w-full"
        >
          <Plus size={18} /> Tambah Transaksi
        </button>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}