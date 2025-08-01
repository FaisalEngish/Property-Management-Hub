/**
 * Currency formatting utilities for Thai Baht (THB)
 */

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '฿0';
  }
  
  // Format as Thai Baht with proper locale
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithDecimals(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '฿0.00';
  }
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }
  
  return new Intl.NumberFormat('th-TH').format(amount);
}