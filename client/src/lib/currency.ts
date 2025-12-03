/**
 * Currency formatting utilities for Thai Baht (THB)
 */

export function formatCurrency(amount: number | string | null | undefined): string {
  // Handle null/undefined
  if (amount == null) {
    return '฿0';
  }
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return '฿0';
  }
  
  // Format as Thai Baht with proper locale
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

export function formatCurrencyWithDecimals(amount: number | string | null | undefined): string {
  // Handle null/undefined
  if (amount == null) {
    return '฿0.00';
  }
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return '฿0.00';
  }
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function formatNumber(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }
  
  return new Intl.NumberFormat('th-TH').format(amount);
}