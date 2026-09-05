"use client";
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, ScanLine, Loader2, UploadCloud, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const processImage = async (file) => {
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsScanning(true);
    setScanStatus('Menyiapkan Mesin AI...');

    try {
      // PROSES OCR ASLI MENGGUNAKAN TESSERACT
      const result = await Tesseract.recognize(
        file,
        'ind+eng', // Membaca bahasa Indonesia & Inggris
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanStatus(`Mengekstrak Teks: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const text = result.data.text;
      
      // LOGIKA PARSING (MENCARI NAMA TOKO & TOTAL HARGA)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // 1. Asumsikan baris pertama yang terbaca adalah nama Merchant
      const detectedMerchant = lines.length > 0 ? lines[0] : 'Tidak Terbaca';

      // 2. Cari angka terbesar di dalam struk (biasanya itu adalah Total)
      let detectedTotal = 0;
      const numberPattern = /\b\d{1,3}(?:\.\d{3})*(?:,\d+)?\b|\b\d+\b/g;

      lines.forEach(line => {
        const matches = line.match(numberPattern);
        if (matches) {
          matches.forEach(match => {
            // Bersihkan titik dan koma agar bisa diubah jadi angka murni
            const cleanNum = parseFloat(match.replace(/\./g, '').replace(/,/g, '.'));
            // Kita abaikan angka yang terlalu tidak masuk akal (misal > 1 Milyar karena salah baca barcode)
            if (!isNaN(cleanNum) && cleanNum > detectedTotal && cleanNum < 100000000) {
              detectedTotal = cleanNum;
            }
          });
        }
      });

      setIsScanning(false);
      
      // Kirim hasil bacaan asli ke Modal
      const scannedData = {
        type: 'expense',
        amount: detectedTotal > 0 ? detectedTotal.toString() : '',
        source: detectedMerchant.substring(0, 30), // Batasi panjang karakter
        category: 'Umum'
      };

      window.dispatchEvent(new CustomEvent('openTransactionModal', { detail: scannedData }));

    } catch (error) {
      console.error("Gagal melakukan scan:", error);
      alert("Gagal membaca gambar. Pastikan gambar jelas.");
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setPreviewUrl(null);
    setIsScanning(false);
  };

  return (
    <section className="max-w-xl mx-auto space-y-6 pt-4 pb-12">
      <header className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Smart Scanner</h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Foto struk belanja Anda, dan AI kami akan otomatis menyalin nominal dan nama merchant ke dalam catatan.
        </p>
      </header>

      <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-4 min-h-[400px] flex flex-col items-center justify-center shadow-sm overflow-hidden transition-all">
        
        {!previewUrl ? (
          <div className="text-center px-6">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Unggah Struk</h3>
            <p className="text-slate-500 text-sm mb-8">Pastikan foto struk terlihat jelas, tidak blur, dan pencahayaan cukup agar OCR bisa membaca dengan akurat.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={(e) => processImage(e.target.files[0])} />
              <button onClick={() => cameraRef.current?.click()} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all w-full sm:w-auto">
                <Camera size={20} /> Ambil Foto
              </button>

              <input type="file" accept="image/*" className="hidden" ref={galleryRef} onChange={(e) => processImage(e.target.files[0])} />
              <button onClick={() => galleryRef.current?.click()} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto">
                <ImageIcon size={20} /> Buka Galeri
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center">
            {!isScanning && (
              <button onClick={resetScanner} className="absolute top-2 right-2 p-2 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-full backdrop-blur-md z-10 transition-colors">
                <X size={20} />
              </button>
            )}

            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-slate-100">
              <img src={previewUrl} alt="Struk" className={`w-full h-auto object-cover ${isScanning ? 'opacity-75 grayscale-[30%]' : 'opacity-100'} transition-all duration-500`} />
              
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 bg-indigo-600/10 animate-pulse" />
                </div>
              )}
            </div>

            {isScanning && (
              <div className="mt-8 flex flex-col items-center text-indigo-600">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="font-bold tracking-wider uppercase text-sm animate-pulse">{scanStatus}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(300px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </section>
  );
}