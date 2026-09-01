"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TransactionModal from '@/components/TransactionModal';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  
  // State untuk Modal Tambah Transaksi ada di sini, sehingga Sidebar selalu terhubung!
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const bodyData = {
        amount: parseFloat(newTx.amount),
        source: newTx.source,
        category: newTx.category,
        type: newTx.type,
        date: newTx.date
      };
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTx({ type: 'expense', amount: '', source: '', category: 'Umum', date: new Date().toISOString().split('T')[0] });
        
        // Memerintahkan Next.js memuat ulang data tanpa me-refresh browser penuh
        router.refresh(); 
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      <Sidebar setIsModalOpen={setIsModalOpen} />
      
      {/* Area ini yang akan otomatis diisi oleh halaman Ledger, Wishlist, dll */}
      <main className="lg:ml-64 flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <TransactionModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        newTx={newTx} 
        setNewTx={setNewTx} 
        handleAddTransaction={handleAddTransaction} 
        editingId={null} 
      />
    </div>
  );
}