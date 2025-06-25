import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseInterval = (interval: string): number => {
  const match = interval.match(/^(\d+)([smhd])$/);
  if (!match) return 60; // Default to 60 seconds if parsing fails
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 60;
  }
};

export function getBigNumber(value: number): string {
    if (typeof value !== 'number') {
        return '0';
    }

    const suffixes = ['', 'K', 'M', 'B'];
    let index = 0;

    while (Math.abs(value) >= 1000 && index < suffixes.length - 1) {
        value /= 1000;
        index++;
    }

    return `${value.toFixed(1).replace(/\.0$/, '')}${suffixes[index]}`;
}

export function getSymbol(s: string) {
    if (!s) {
        return s
    }
		return s
			.replace('10000', '')
			.replace('1000', '')
			.replace("_", "")
			.replace("/", "")
			.replace("-", "")
			.replaceAll(/[\W_]+/g, "")
			.replace('USDT', '')
			.toUpperCase()
}
