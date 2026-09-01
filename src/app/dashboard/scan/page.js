"use client";
import React from 'react';
import { UploadCloud } from 'lucide-react';

export default function ScannerPage() {
  return (
    <section className="space-y-6 max-w-2xl mx-auto mt-10">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Smart Scanner</h2>
        <p className="text-slate-500 mt-1">Unggah struk belanja untuk diekstrak otomatis menggunakan AI.</p>
      </header>
      <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <UploadCloud size={32} />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-2">Tarik & Lepas Dokumen</h4>
        <p className="text-slate-400 mb-6 text-sm">Mendukung format JPG, PNG, PDF (Maks. 10MB)</p>
        <button onClick={() => alert("Sistem OCR sedang dalam tahap pengembangan.")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors cursor-pointer">
          Simulate Scan
        </button>
      </div>
    </section>
  );
}