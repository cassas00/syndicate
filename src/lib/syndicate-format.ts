export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / total);
}
