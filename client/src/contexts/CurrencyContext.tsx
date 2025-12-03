import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fastCache } from '@/lib/fastCache';

interface ExchangeRates {
  [currencyCode: string]: number;
}

interface CurrencyContextType {
  baseCurrency: string;
  displayCurrency: string;
  rates: ExchangeRates;
  symbols: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  setDisplayCurrency: (code: string) => Promise<void>;
  convertAmount: (amount: number | string | null | undefined, fromCurrency?: string) => number;
  formatCurrency: (amount: number | string | null | undefined, options?: FormatOptions) => string;
  formatCurrencyWithConversion: (amount: number | string | null | undefined, fromCurrency?: string, options?: FormatOptions) => string;
  getRate: (from: string, to: string) => number;
  refetchRates: () => void;
}

interface FormatOptions {
  decimals?: number;
  showSymbol?: boolean;
}

interface SystemSettings {
  baseCurrency: string;
  displayCurrency: string;
  defaultCurrency: string;
  companyName: string;
  dateFormat: string;
  timezone: string;
}

interface RatesResponse {
  baseCurrency: string;
  rates: ExchangeRates;
  symbols: Record<string, string>;
  supportedCurrencies: string[];
  lastUpdated: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  THB: '฿',
  JPY: '¥',
  AUD: 'A$',
  SGD: 'S$',
  MYR: 'RM',
  INR: '₹',
  CNY: '¥',
};

const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  THB: 'th-TH',
  JPY: 'ja-JP',
  AUD: 'en-AU',
  SGD: 'en-SG',
  MYR: 'ms-MY',
  INR: 'en-IN',
  CNY: 'zh-CN',
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  THB: 35.5,
  JPY: 149.5,
  AUD: 1.53,
  SGD: 1.34,
  MYR: 4.47,
  INR: 83.5,
  CNY: 7.24,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch system settings (includes baseCurrency and displayCurrency)
  const { data: systemSettings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/system-settings'],
    staleTime: 0, // Always get fresh data
    refetchOnWindowFocus: true,
  });

  const baseCurrency = systemSettings?.baseCurrency || 'USD';
  const displayCurrency = systemSettings?.displayCurrency || baseCurrency;

  // Fetch exchange rates based on base currency
  // Include baseCurrency in the URL as query param so server uses correct base
  const { data: ratesData, isLoading: ratesLoading, refetch: refetchRates } = useQuery<RatesResponse>({
    queryKey: ['/api/currency/rates', baseCurrency],
    queryFn: async () => {
      const res = await fetch(`/api/currency/rates?base=${baseCurrency}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch rates');
      return res.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!baseCurrency,
  });

  // Use fetched rates or fallback rates to ensure conversion always works
  const rates = ratesData?.rates || FALLBACK_RATES;
  const symbols = ratesData?.symbols || CURRENCY_SYMBOLS;

  // Clear stale currency cache when baseCurrency changes (prevents incorrect conversions)
  useEffect(() => {
    if (baseCurrency) {
      // Clear any cached currency rates that might have been stored with wrong base
      fastCache.deleteByPattern('/api/currency');
      console.log(`💱 Currency context: baseCurrency=${baseCurrency}, displayCurrency=${displayCurrency}`);
    }
  }, [baseCurrency, displayCurrency]);

  // Set display currency (saves to backend)
  const setDisplayCurrency = useCallback(async (code: string) => {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayCurrency: code }),
      });

      if (!response.ok) {
        throw new Error('Failed to update currency');
      }

      // Clear ALL fastCache entries to ensure fresh data
      fastCache.deleteByPattern('/api/system-settings');
      fastCache.deleteByPattern('/api/currency');
      fastCache.deleteByPattern('/api/finance');
      fastCache.deleteByPattern('/api/dashboard');
      fastCache.deleteByPattern('/api/properties');
      fastCache.deleteByPattern('/api/bookings');

      // Force immediate refetch of critical queries (not just invalidate)
      await queryClient.refetchQueries({ queryKey: ['/api/system-settings'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['/api/currency/rates'], type: 'active' });
      
      // Invalidate all related data so they refetch with new currency
      queryClient.invalidateQueries({ queryKey: ['/api/finance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      setError(null);
    } catch (err) {
      console.error('Error setting display currency:', err);
      setError('Failed to update currency');
    }
  }, [queryClient]);

  // Convert amount from one currency to display currency
  const convertAmount = useCallback((
    amount: number | string | null | undefined,
    fromCurrency: string = baseCurrency
  ): number => {
    if (amount == null) return 0;
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 0;

    // If currencies are the same, no conversion needed
    if (fromCurrency === displayCurrency) {
      return numAmount;
    }

    // Get conversion rate
    const rate = getRate(fromCurrency, displayCurrency);
    return numAmount * rate;
  }, [baseCurrency, displayCurrency, rates]);

  // Get conversion rate between two currencies
  const getRate = useCallback((from: string, to: string): number => {
    if (from === to) return 1;
    
    // If we have rates with 'from' as base
    if (from === baseCurrency && rates[to]) {
      return rates[to];
    }
    
    // If we need to convert through baseCurrency
    if (rates[from] && rates[to]) {
      // Both are relative to baseCurrency
      // from -> baseCurrency -> to
      // rate = (1 / rates[from]) * rates[to]
      return rates[to] / rates[from];
    }

    // Fallback: no conversion
    console.warn(`No rate found for ${from} -> ${to}`);
    return 1;
  }, [baseCurrency, rates]);

  // Format amount with currency symbol (no conversion)
  const formatCurrency = useCallback((
    amount: number | string | null | undefined,
    options: FormatOptions = {}
  ): string => {
    if (amount == null) {
      const symbol = options.showSymbol !== false ? (symbols[displayCurrency] || displayCurrency) : '';
      return `${symbol}0`;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      const symbol = options.showSymbol !== false ? (symbols[displayCurrency] || displayCurrency) : '';
      return `${symbol}0`;
    }

    const symbol = options.showSymbol !== false ? (symbols[displayCurrency] || displayCurrency) : '';
    const locale = CURRENCY_LOCALES[displayCurrency] || 'en-US';
    
    // JPY and THB typically don't use decimals
    const useDecimals = !['JPY', 'THB'].includes(displayCurrency);
    const decimals = options.decimals ?? (useDecimals ? 2 : 0);

    try {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(numAmount);

      return `${symbol}${formatted}`;
    } catch {
      return `${symbol}${numAmount.toLocaleString()}`;
    }
  }, [displayCurrency, symbols]);

  // Format with conversion from base currency to display currency
  const formatCurrencyWithConversion = useCallback((
    amount: number | string | null | undefined,
    fromCurrency: string = baseCurrency,
    options: FormatOptions = {}
  ): string => {
    const converted = convertAmount(amount, fromCurrency);
    return formatCurrency(converted, options);
  }, [convertAmount, formatCurrency, baseCurrency]);

  const value: CurrencyContextType = {
    baseCurrency,
    displayCurrency,
    rates,
    symbols,
    isLoading: settingsLoading || ratesLoading,
    error,
    setDisplayCurrency,
    convertAmount,
    formatCurrency,
    formatCurrencyWithConversion,
    getRate,
    refetchRates: () => refetchRates(),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
}

export { CurrencyContext };
