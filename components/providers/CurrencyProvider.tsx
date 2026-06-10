'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { CurrencyConverter } from '@/lib/currency-service';
import apiClient from '@/lib/api-client';

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { setRates } = useAuthStore();

  useEffect(() => {
    // 1. Initialize from localStorage immediately (if available) to prevent layout shifts
    const cachedRatesStr = localStorage.getItem('exchangeRates');
    if (cachedRatesStr) {
      try {
        const cachedRates = JSON.parse(cachedRatesStr);
        if (cachedRates && typeof cachedRates === 'object' && cachedRates.USD === 1) {
          console.log('Loading exchange rates from localStorage:', cachedRates);
          setRates(cachedRates);
          CurrencyConverter.updateRates(cachedRates);
        }
      } catch (err) {
        console.error('Failed to parse cached rates from localStorage', err);
      }
    }

    // 2. Fetch fresh rates from backend API
    const fetchFreshRates = async () => {
      try {
        const res = await apiClient.get('/currency/exchange-rates');
        const rates = res.data?.data?.rates;
        if (rates && typeof rates === 'object' && rates.USD === 1) {
          console.log('Fetched fresh exchange rates from API:', rates);
          setRates(rates);
          CurrencyConverter.updateRates(rates);
          localStorage.setItem('exchangeRates', JSON.stringify(rates));
        }
      } catch (err) {
        console.error('Failed to fetch fresh exchange rates from backend API', err);
      }
    };

    fetchFreshRates();
  }, [setRates]);

  return <>{children}</>;
}
