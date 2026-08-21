import { PLATFORM_FEE_PERCENTAGE } from '../constants/platform-fee.constant';

export function formatCurrency(amountInCents: number, currency = 'USD'): string {
  const amountInRupees = currency === 'INR' ? amountInCents : amountInCents * 0.83;
  const rupees = (amountInRupees / 100).toFixed(2);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
  }).format(Number(rupees));
}

export function calculatePlatformFee(amountInCents: number): number {
  return Math.round((amountInCents * PLATFORM_FEE_PERCENTAGE) / 100);
}

export function calculatePayout(amountInCents: number): number {
  return amountInCents - calculatePlatformFee(amountInCents);
}