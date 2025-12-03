import { useQuery } from "@tanstack/react-query";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface SystemSettings {
  id: number;
  organizationId: string;
  baseCurrency: string;
  displayCurrency: string;
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  companyName: string;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  THB: { code: "THB", symbol: "฿", locale: "th-TH", name: "Thai Baht" },
  USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  JPY: { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  AUD: { code: "AUD", symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  SGD: { code: "SGD", symbol: "S$", locale: "en-SG", name: "Singapore Dollar" },
  MYR: { code: "MYR", symbol: "RM", locale: "ms-MY", name: "Malaysian Ringgit" },
  INR: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  CNY: { code: "CNY", symbol: "¥", locale: "zh-CN", name: "Chinese Yuan" },
};

const DEFAULT_CURRENCY = "USD";

/**
 * Enhanced useCurrency hook with real currency conversion
 * Uses CurrencyContext for conversion rates and formatting
 */
export function useCurrency() {
  // Try to use context first (provides conversion)
  let contextAvailable = false;
  let currencyContext: ReturnType<typeof useCurrencyContext> | null = null;
  
  try {
    currencyContext = useCurrencyContext();
    contextAvailable = true;
  } catch {
    // Context not available, fall back to basic behavior
    contextAvailable = false;
  }

  // Fallback: fetch system settings directly if context not available
  const { data: systemSettings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
    staleTime: 0,
    gcTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !contextAvailable, // Only fetch if context not available
  });

  // Use context values if available, otherwise fallback
  const baseCurrency = contextAvailable 
    ? currencyContext!.baseCurrency 
    : (systemSettings?.baseCurrency || DEFAULT_CURRENCY);
  
  const displayCurrency = contextAvailable 
    ? currencyContext!.displayCurrency 
    : (systemSettings?.displayCurrency || systemSettings?.defaultCurrency || DEFAULT_CURRENCY);

  const currencyCode = displayCurrency;
  const currencyConfig = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS[DEFAULT_CURRENCY];

  // Format currency WITHOUT conversion (for already-converted amounts)
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount == null) {
      return `${currencyConfig.symbol}0`;
    }

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (typeof numAmount !== "number" || isNaN(numAmount)) {
      return `${currencyConfig.symbol}0`;
    }

    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: "currency",
        currency: currencyConfig.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount);
    } catch {
      return `${currencyConfig.symbol}${numAmount.toLocaleString()}`;
    }
  };

  // Format currency with decimals WITHOUT conversion
  const formatCurrencyWithDecimals = (amount: number | string | null | undefined): string => {
    if (amount == null) {
      return `${currencyConfig.symbol}0.00`;
    }

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (typeof numAmount !== "number" || isNaN(numAmount)) {
      return `${currencyConfig.symbol}0.00`;
    }

    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: "currency",
        currency: currencyConfig.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch {
      return `${currencyConfig.symbol}${numAmount.toFixed(2)}`;
    }
  };

  // Convert amount from base currency to display currency
  const convertAmount = (amount: number | string | null | undefined, fromCurrency?: string): number => {
    if (amount == null) return 0;
    
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 0;

    if (contextAvailable && currencyContext) {
      return currencyContext.convertAmount(numAmount, fromCurrency || baseCurrency);
    }

    // Fallback: no conversion
    return numAmount;
  };

  // Format currency WITH conversion from base currency
  const formatWithConversion = (
    amount: number | string | null | undefined, 
    fromCurrency?: string
  ): string => {
    if (contextAvailable && currencyContext) {
      return currencyContext.formatCurrencyWithConversion(amount, fromCurrency || baseCurrency);
    }

    // Fallback: format without conversion
    return formatCurrency(amount);
  };

  const formatNumber = (amount: number | string | null | undefined): string => {
    if (amount == null) return "0";
    
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (typeof numAmount !== "number" || isNaN(numAmount)) {
      return "0";
    }

    return new Intl.NumberFormat(currencyConfig.locale).format(numAmount);
  };

  // Get conversion rate between currencies
  const getRate = (from: string, to: string): number => {
    if (contextAvailable && currencyContext) {
      return currencyContext.getRate(from, to);
    }
    return 1; // Fallback: no conversion
  };

  return {
    // Currency info
    currencyCode,
    currencySymbol: currencyConfig.symbol,
    currencyName: currencyConfig.name,
    currencyLocale: currencyConfig.locale,
    baseCurrency,
    displayCurrency,
    
    // Formatting functions (no conversion)
    formatCurrency,
    formatCurrencyWithDecimals,
    formatNumber,
    
    // Conversion functions
    convertAmount,
    formatWithConversion,
    getRate,
    
    // State
    isLoading: contextAvailable ? currencyContext!.isLoading : isLoading,
    systemSettings: contextAvailable ? null : systemSettings,
    
    // Context reference for advanced usage
    hasConversionSupport: contextAvailable,
  };
}

export function formatCurrencyStatic(
  amount: number | string | null | undefined,
  currencyCode: string = DEFAULT_CURRENCY
): string {
  if (amount == null) {
    const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS[DEFAULT_CURRENCY];
    return `${config.symbol}0`;
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS[DEFAULT_CURRENCY];

  if (typeof numAmount !== "number" || isNaN(numAmount)) {
    return `${config.symbol}0`;
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch {
    return `${config.symbol}${numAmount.toLocaleString()}`;
  }
}

export { CURRENCY_CONFIGS, DEFAULT_CURRENCY };
