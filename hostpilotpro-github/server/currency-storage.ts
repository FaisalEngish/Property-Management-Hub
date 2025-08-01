import { and, eq } from "drizzle-orm";
import { currencyRates, taxRules, type CurrencyRate, type TaxRule } from "@/shared/schema";
import type { DatabaseStorage } from "./storage";

export class CurrencyTaxStorage {
  constructor(private db: DatabaseStorage['db']) {}

  // ===== CURRENCY RATE METHODS =====

  async getCurrencyRates(): Promise<CurrencyRate[]> {
    return await this.db.select().from(currencyRates);
  }

  async getCurrencyRate(baseCurrency: string, targetCurrency: string): Promise<CurrencyRate | null> {
    const [rate] = await this.db
      .select()
      .from(currencyRates)
      .where(and(
        eq(currencyRates.baseCurrency, baseCurrency),
        eq(currencyRates.targetCurrency, targetCurrency)
      ))
      .limit(1);
    return rate || null;
  }

  async updateCurrencyRate(baseCurrency: string, targetCurrency: string, rate: number): Promise<void> {
    await this.db
      .insert(currencyRates)
      .values({
        baseCurrency,
        targetCurrency,
        rate: rate.toString(),
      })
      .onConflictDoUpdate({
        target: [currencyRates.baseCurrency, currencyRates.targetCurrency],
        set: {
          rate: rate.toString(),
          updatedAt: new Date(),
        },
      });
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getCurrencyRate(fromCurrency, toCurrency);
    if (!rate) {
      throw new Error(`Currency conversion rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    return amount * parseFloat(rate.rate);
  }

  // ===== TAX RULE METHODS =====

  async getTaxRules(): Promise<TaxRule[]> {
    return await this.db.select().from(taxRules);
  }

  async getTaxRuleByRegion(region: string): Promise<TaxRule | null> {
    const [rule] = await this.db
      .select()
      .from(taxRules)
      .where(eq(taxRules.region, region))
      .limit(1);
    return rule || null;
  }

  async updateTaxRule(region: string, vatRate?: number, gstRate?: number, whtRate?: number): Promise<void> {
    await this.db
      .insert(taxRules)
      .values({
        region,
        vatRate: vatRate?.toString(),
        gstRate: gstRate?.toString(),
        whtRate: whtRate?.toString(),
      })
      .onConflictDoUpdate({
        target: [taxRules.region],
        set: {
          vatRate: vatRate?.toString(),
          gstRate: gstRate?.toString(),
          whtRate: whtRate?.toString(),
        },
      });
  }

  async calculateTax(amount: number, region: string, taxType: 'vat' | 'gst' | 'wht'): Promise<number> {
    const taxRule = await this.getTaxRuleByRegion(region);
    if (!taxRule) {
      throw new Error(`Tax rule not found for region: ${region}`);
    }

    let rate = 0;
    switch (taxType) {
      case 'vat':
        rate = taxRule.vatRate ? parseFloat(taxRule.vatRate) : 0;
        break;
      case 'gst':
        rate = taxRule.gstRate ? parseFloat(taxRule.gstRate) : 0;
        break;
      case 'wht':
        rate = taxRule.whtRate ? parseFloat(taxRule.whtRate) : 0;
        break;
    }

    return amount * (rate / 100);
  }

  // ===== UTILITY METHODS =====

  async formatCurrency(amount: number, currency: string): Promise<string> {
    const symbols: Record<string, string> = {
      'THB': '฿',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
    };

    const symbol = symbols[currency] || currency;
    
    // Format based on currency
    if (currency === 'THB') {
      return `${symbol}${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else {
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const rates = await this.getCurrencyRates();
    const currencies = new Set<string>();
    
    rates.forEach(rate => {
      currencies.add(rate.baseCurrency);
      currencies.add(rate.targetCurrency);
    });

    return Array.from(currencies).sort();
  }
}