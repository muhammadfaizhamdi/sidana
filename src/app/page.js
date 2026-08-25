"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, Receipt, ScanLine, PieChart, 
  Plus, Bell, UploadCloud, Trash2, TrendingUp 
} from 'lucide-react';

export default function SidanaApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2026-08-27', category: 'Food & Dining', source: 'Whole Foods', amount: 142.50, type: 'expense' },
    { id: 2, date: '2026-08-26', category: 'Salary', source: 'Tech Corp Inc.', amount: 4250.00, type: 'income' },
    { id: 3, date: '2026-08-25', category: 'Transportation', source: 'Uber', amount: 24.50, type: 'expense' },
  ]);

  const formatMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 p-6 fixed h-full z-40 shadow-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Sidana.
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Institutional Grade</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <NavButton id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="ledger" icon={<Receipt size={20} />} label="Ledger" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="scan" icon={<ScanLine size={20} />} label="Smart Scanner" activeView={activeView} setActiveView={setActiveView} />
          <NavButton id="analytics" icon={<PieChart size={20} />} label="Analytics" activeView={activeView} setActiveView={setActiveView} />
        </nav>

        <button className="bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
          <Plus size={18} /> New Transaction
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="lg:ml-64 flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <section className="space-y-6">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h2>
                <p className="text-slate-500 mt-1">Welcome back, here's your real-time wealth status.</p>
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                <Bell size={20} className="text-slate-600" />
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                <div className="flex items-baseline gap-4 mt-2">
                  <h3 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">$124,592.00</h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <TrendingUp size={16} /> +2.4%
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">vs last month ($121,671.87)</p>
                <div className="mt-8 flex gap-4">
                  <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">Deposit</button>
                  <button className="bg-slate-100 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors">Transfer</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Strategy Status</p>
                  <div className="text-2xl font-bold text-slate-800 mt-2">On Track 🎯</div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">50/30/20 allocation rule is currently optimized.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h4>
              <div className="flex flex-col gap-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                        {tx.source.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{tx.source}</p>
                        <p className="text-xs text-slate-400">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold tabular-nums ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SCANNER VIEW */}
        {activeView === 'scan' && (
          <section className="space-y-6 max-w-2xl mx-auto">
             <header className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Smart Receipt Scanner</h2>
                <p className="text-slate-500 mt-1">Upload a receipt to extract data using AI.</p>
            </header>
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Drag & Drop Receipt</h4>
              <p className="text-slate-400 mb-6 text-sm">Supports JPG, PNG, PDF up to 10MB</p>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                Simulate Scan
              </button>
            </div>
          </section>
        )}

        {/* LEDGER & ANALYTICS PLACEHOLDERS */}
        {activeView === 'ledger' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Transaction Ledger</h2>
            <p className="text-slate-500">Full CRUD ledger interface coming right up here.</p>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics & Budgets</h2>
            <p className="text-slate-500">50/30/20 breakdown charts and metrics.</p>
          </div>
        )}

      </main>
    </div>
  );
}

function NavButton({ id, icon, label, activeView, setActiveView }) {
  const isActive = activeView === id;
  return (
    <button 
      onClick={() => setActiveView(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left
        ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon} {label}
    </button>
  );
}