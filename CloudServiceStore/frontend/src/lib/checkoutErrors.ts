import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string; title?: string } | undefined;
    return data?.detail || data?.message || data?.title || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isInsufficientWalletBalance(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 409) return false;
  const message = getApiErrorMessage(error).toLowerCase();
  return (
    message.includes('số dư') ||
    message.includes('không đủ') ||
    message.includes('insufficient')
  );
}

export function suggestTopUpAmount(shortfall: number): number {
  if (shortfall <= 0) return 100_000;
  if (shortfall <= 100_000) return 100_000;
  if (shortfall <= 500_000) return Math.ceil(shortfall / 100_000) * 100_000;
  return Math.ceil(shortfall / 500_000) * 500_000;
}
