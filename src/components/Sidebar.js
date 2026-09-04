"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, ScanLine, PieChart, Activity, Settings, Star, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({ href, icon, label, onClick }) => {
    const isActive = pathname === href;
    
    // Jika ada onClick (untuk tombol Keluar), gunakan <button> tapi desainnya persis sama
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          {icon} {label}
        </button>
      );
    }

    // Untuk link navigasi biasa
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left cursor-pointer ${
          isActive ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        {icon} {label}
      </Link>
    );
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.replace('/');
  };

  return (
    <aside className="w-64 hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 p-6 fixed h-full z-40 shadow-sm">
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
          Sidana.
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Manajemen Keuangan</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Beranda" />
        <NavLink href="/dashboard/ledger" icon={<Receipt size={20} />} label="Riwayat" />
        <NavLink href="/dashboard/scan" icon={<ScanLine size={20} />} label="Smart Scanner" />
        <NavLink href="/dashboard/analytics" icon={<Activity size={20} />} label="Analytics" />
        <NavLink href="/dashboard/budget" icon={<PieChart size={20} />} label="Anggaran" />
        <NavLink href="/dashboard/wishlist" icon={<Star size={20} />} label="Wishlist" />
      </nav>

      <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-slate-200">
        <NavLink href="/dashboard/settings" icon={<Settings size={20} />} label="Pengaturan" />
        <NavLink onClick={handleLogout} icon={<LogOut size={20} />} label="Keluar" />
      </div>
    </aside>
  );
}