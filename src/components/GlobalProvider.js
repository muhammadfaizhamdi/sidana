"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

// Membuat terowongan data global
const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalProvider({ children }) {
  const [isUSD, setIsUSD] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(15500);

  useEffect(() => {
    // 1. Baca pengaturan mata uang
    const storedCurrency = localStorage.getItem('sidana_isUSD');
    if (storedCurrency === 'true') setIsUSD(true);

    // 2. Ambil kurs asli USD to IDR
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.rates?.IDR) setExchangeRate(data.rates.IDR);
      } catch (error) {
        console.error("Gagal mengambil kurs:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  // Fungsi mengubah mata uang global tanpa perlu refresh halaman
  const toggleCurrency = () => {
    const newValue = !isUSD;
    setIsUSD(newValue);
    localStorage.setItem('sidana_isUSD', newValue.toString());
  };

  // Fungsi sakti untuk memformat uang dari manapun di aplikasi
  const formatMoney = (amount) => {
    if (isUSD) {
      const usdAmount = amount / exchangeRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdAmount);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <SessionProvider>
      <GlobalContext.Provider value={{ isUSD, toggleCurrency, formatMoney, exchangeRate }}>
        {children}
      </GlobalContext.Provider>
    </SessionProvider>
  );
}