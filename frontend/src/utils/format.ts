export const formatMoney = (valueCents: number) =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(valueCents / 100);

export const statusLabel = (status: string) =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
