/**
 * Currency Conversion Service
 * Fetches real exchange rates from ExchangeRate-API and caches them
 */

interface ExchangeRates {
  [currencyCode: string]: number;
}

interface CachedRates {
  baseCurrency: string;
  rates: ExchangeRates;
  timestamp: number;
}

// In-memory cache for exchange rates (12-hour cache)
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
let ratesCache: CachedRates | null = null;

// Supported currencies
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'THB', 'JPY', 'AUD', 'SGD', 'MYR', 'INR', 'CNY'];

// Fallback rates (USD as base) - used if API fails
const FALLBACK_RATES: ExchangeRates = {
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

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
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

// Currency locales for formatting
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

/**
 * Try fetching from Frankfurter API (European Central Bank data - FREE, no API key required!)
 * This is the primary provider as it's reliable, free, and updates daily
 */
async function tryFrankfurterAPI(baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    // Build list of target currencies (exclude base currency)
    const targetCurrencies = SUPPORTED_CURRENCIES.filter(c => c !== baseCurrency).join(',');
    const url = `https://api.frankfurter.dev/v1/latest?from=${baseCurrency}&to=${targetCurrencies}`;
    console.log('[CURRENCY] Trying Frankfurter API (ECB data)...');
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`[CURRENCY] Frankfurter API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.rates) return null;
    
    const rates: ExchangeRates = { [baseCurrency]: 1 }; // Base currency rate is 1
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.rates?.[currency] !== undefined) {
        rates[currency] = data.rates[currency];
      }
    }
    console.log(`[CURRENCY] Frankfurter API success! Date: ${data.date}, ${Object.keys(rates).length} currencies`);
    return Object.keys(rates).length > 1 ? rates : null;
  } catch (error) {
    console.log('[CURRENCY] Frankfurter API error:', error);
    return null;
  }
}

/**
 * Try fetching from ExchangeRate-API v6
 */
async function tryExchangeRateAPI(apiKey: string, baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    console.log('[CURRENCY] Trying ExchangeRate-API...');
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.result !== 'success') return null;
    
    const rates: ExchangeRates = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.conversion_rates?.[currency] !== undefined) {
        rates[currency] = data.conversion_rates[currency];
      }
    }
    console.log('[CURRENCY] ExchangeRate-API success!');
    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

/**
 * Try fetching from FreeCurrencyAPI
 */
async function tryFreeCurrencyAPI(apiKey: string, baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}`;
    console.log('[CURRENCY] Trying FreeCurrencyAPI...');
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.data) return null;
    
    const rates: ExchangeRates = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.data?.[currency] !== undefined) {
        rates[currency] = data.data[currency];
      }
    }
    console.log('[CURRENCY] FreeCurrencyAPI success!');
    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

/**
 * Try fetching from Open Exchange Rates
 */
async function tryOpenExchangeRates(apiKey: string, baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    // Note: Free tier only supports USD base
    const url = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;
    console.log('[CURRENCY] Trying OpenExchangeRates...');
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.rates) return null;
    
    // Convert rates to requested base currency
    const baseRate = baseCurrency === 'USD' ? 1 : data.rates[baseCurrency];
    if (!baseRate) return null;
    
    const rates: ExchangeRates = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      if (data.rates?.[currency] !== undefined) {
        rates[currency] = data.rates[currency] / baseRate;
      }
    }
    console.log('[CURRENCY] OpenExchangeRates success!');
    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

/**
 * Try fetching from CurrencyLayer
 */
async function tryCurrencyLayer(apiKey: string, baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const url = `http://api.currencylayer.com/live?access_key=${apiKey}&source=${baseCurrency}`;
    console.log('[CURRENCY] Trying CurrencyLayer...');
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.success || !data.quotes) return null;
    
    const rates: ExchangeRates = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      const key = `${baseCurrency}${currency}`;
      if (data.quotes?.[key] !== undefined) {
        rates[currency] = data.quotes[key];
      }
    }
    console.log('[CURRENCY] CurrencyLayer success!');
    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

/**
 * Fetch exchange rates from multiple providers (tries each until one succeeds)
 * Priority: Frankfurter (free, no key) > API key providers > fallback rates
 */
async function fetchRatesFromAPI(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  console.log('[CURRENCY] Fetching real-time exchange rates...');
  
  // First, try Frankfurter API (free, no API key required, ECB data)
  const frankfurterRates = await tryFrankfurterAPI(baseCurrency);
  if (frankfurterRates) {
    console.log(`[CURRENCY] Using Frankfurter API (ECB data) - ${Object.keys(frankfurterRates).length} currencies`);
    return frankfurterRates;
  }
  
  // If Frankfurter fails, try API key based providers
  const apiKey = process.env.CURRENCY_API_KEY || process.env.EXCHANGE_RATES_API_KEY;
  
  if (apiKey) {
    console.log('[CURRENCY] Frankfurter failed, trying API key providers...');
    const providers = [
      () => tryExchangeRateAPI(apiKey, baseCurrency),
      () => tryFreeCurrencyAPI(apiKey, baseCurrency),
      () => tryOpenExchangeRates(apiKey, baseCurrency),
      () => tryCurrencyLayer(apiKey, baseCurrency),
    ];

    for (const tryProvider of providers) {
      const rates = await tryProvider();
      if (rates) {
        console.log(`[CURRENCY] Successfully fetched rates for ${Object.keys(rates).length} currencies`);
        return rates;
      }
    }
  }

  console.log('[CURRENCY] All API providers failed, using fallback rates');
  return convertFallbackToBase(baseCurrency);
}

/**
 * Convert fallback rates (USD base) to a different base currency
 */
function convertFallbackToBase(baseCurrency: string): ExchangeRates {
  if (baseCurrency === 'USD') {
    return { ...FALLBACK_RATES };
  }

  const baseRate = FALLBACK_RATES[baseCurrency];
  if (!baseRate) {
    console.warn(`[CURRENCY] Unknown base currency: ${baseCurrency}, defaulting to USD`);
    return { ...FALLBACK_RATES };
  }

  // Convert all rates relative to the new base
  const convertedRates: ExchangeRates = {};
  for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
    convertedRates[currency] = rate / baseRate;
  }

  return convertedRates;
}

/**
 * Get exchange rates (with caching)
 */
export async function getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  const now = Date.now();

  // Check if cache is valid
  if (
    ratesCache &&
    ratesCache.baseCurrency === baseCurrency &&
    now - ratesCache.timestamp < CACHE_DURATION_MS
  ) {
    console.log('[CURRENCY] Using cached rates');
    return ratesCache.rates;
  }

  // Fetch fresh rates
  const rates = await fetchRatesFromAPI(baseCurrency);

  // Update cache
  ratesCache = {
    baseCurrency,
    rates,
    timestamp: now,
  };

  return rates;
}

/**
 * Convert an amount from one currency to another
 * Uses THB as reference base for higher precision (matches frontend CurrencyContext)
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // For THB conversions, use THB as base and calculate via inverse for higher precision
  // This matches the frontend CurrencyContext approach: rate = 1 / rates[fromCurrency]
  if (toCurrency === 'THB') {
    const rates = await getRates('THB');
    const fromRate = rates[fromCurrency];
    if (fromRate === undefined || fromRate === 0) {
      console.warn(`[CURRENCY] No rate found for ${fromCurrency}, returning original amount`);
      return amount;
    }
    // Convert using inverse: amount / (fromCurrency rate relative to THB)
    // e.g., USD→THB: amount / 0.03106 = amount * 32.195750
    return amount / fromRate;
  }

  // For other conversions, use standard approach
  const rates = await getRates(fromCurrency);
  const rate = rates[toCurrency];
  if (rate === undefined) {
    console.warn(`[CURRENCY] No rate found for ${toCurrency}, returning original amount`);
    return amount;
  }

  return amount * rate;
}

/**
 * Get the conversion rate between two currencies
 */
export async function getConversionRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const rates = await getRates(fromCurrency);
  return rates[toCurrency] || 1;
}

/**
 * Format an amount with currency symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  options: { decimals?: number } = {}
): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  const locale = CURRENCY_LOCALES[currencyCode] || 'en-US';
  
  // JPY and THB typically don't use decimals
  const useDecimals = !['JPY', 'THB'].includes(currencyCode);
  const decimals = options.decimals ?? (useDecimals ? 2 : 0);

  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);

    return `${symbol}${formatted}`;
  } catch {
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Get all exchange rates for frontend (for client-side conversion)
 */
export async function getAllRatesForFrontend(baseCurrency: string = 'USD'): Promise<{
  baseCurrency: string;
  rates: ExchangeRates;
  symbols: Record<string, string>;
  supportedCurrencies: string[];
  lastUpdated: number;
}> {
  const rates = await getRates(baseCurrency);
  
  return {
    baseCurrency,
    rates,
    symbols: CURRENCY_SYMBOLS,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    lastUpdated: ratesCache?.timestamp || Date.now(),
  };
}

/**
 * Clear the rates cache (useful for testing or forcing refresh)
 */
export function clearRatesCache(): void {
  ratesCache = null;
  console.log('[CURRENCY] Cache cleared');
}

/**
 * Check if a currency is supported
 */
export function isCurrencySupported(currencyCode: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currencyCode.toUpperCase());
}

export { SUPPORTED_CURRENCIES };
