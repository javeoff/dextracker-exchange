import { BigNumber } from "bignumber.js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ADDRESS_SYMBOLS: Record<string, string> = {
  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']: 'USDC',
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB']: 'USDT',
  ['So11111111111111111111111111111111111111112']: 'SOL',
}

export const SYMBOL_ADDRESSES: Record<string, string> = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  SOL: 'So11111111111111111111111111111111111111112',
}

export const getExchangeName = (e: string) => {
  switch (e.toLowerCase()) {
    case 'gate.io':
      return 'gate'
    default:
      return e.toLowerCase();
  }
}

export const getExchangeType = (e: string) => {
  switch (e.toLowerCase()) {
    case 'ray_clmm':
    case 'ray_v2':
    case 'ray_v4':
    case 'meteora_dlmm':
      return 'sol'
    default:
      return 'cex';
  }
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

export function getFullNetwork(n: string) {
  switch(n) {
    case "sol":
      return "solana"
    default:
      return n
  }
}

export function hexToRgba(hex: string, alpha: number = 0.3): string {
  const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getExchangeColor(exchange: string) {
  switch(exchange) {
    case "orca": return "#ffd182";
    case "lbank": return "#e0b828";
    case "lbank-futures": return "#e0b828";
    case "bitmart": return "#cacaca";
    case "htx": return "#3a7291";
    case "htx-futures": return "#008cd6";
    case "bitget": return "#039faa";
    case "xt": return "#e09628";
    case "pump_amm": return "#259068";
    case "solfi": return "#254b56";
    case "ray_v4": return "#61297c";
    case "raydium_clmm": return "#61297c";
    case "meteora_dlmm": return "#68392a";
    case "kucoin": return "#449382";
    case "kucoin-futures": return "#449382";
    case "okx": return "#000000";
    case "okx-futures": return "#000000";
    case "upbit": return "#aac1f2";
    case "coinex": return "#20e6b9";
    case "phemex": return "#003fe6";
    case "gate": return "#2354e6";
    case "mexc": return "#0043ff";
    case "mexc-futures": return "#0043ff";
    default: return '#555555';
  }
}

export function getTagImage(tag: string) {
  switch (tag) {
    case "axiom":
      return "/axiom.png"
    case "trojan":
      return "/trojan.png";
    case "gmgn":
      return "/gmgn.png";
    case "photon":
      return "/photon.png";
    case "pepeboost":
      return "/pepeboost.png";
    case "orca":
      return "/orca.png";
    case "bullx":
      return "/bullx.png";
    case "fish":
      return "/fish.svg";
    case "whale":
      return "/whale.svg";
    case "sandwich_bot":
      return "/sandwich_bot.svg";
    case "fresh_wallet":
      return "/fresh.svg";
    case "bluechip_owner":
      return "/king.svg";
    case "kol":
      return "/kol.svg";
    default:
      return "/"
  }
}
export function getTagTooltip(tag: string) {
  switch (tag) {
    case "axiom":
      return "Axiom Trade"
    case "trojan":
      return "Trojan bot";
    case "gmgn":
      return "Gmgn Ai";
    case "photon":
      return "Photon";
    case "pepeboost":
      return "Pepeboost";
    case "orca":
      return "Orca";
    case "bullx":
      return "Bullx";
    case "fish":
      return "Fish wallet";
    case "whale":
      return "Whale wallet";
    case "sandwich_bot":
      return "Sandwich bot";
    case "fresh_wallet":
      return "Fresh Wallet";
    case "bluechip_owner":
      return "Bluechip Owner";
    case "kol":
      return "Kol";
    default:
      return ""
  }
}

export function getVolumeImage(volume: number): string {
  if (volume >= 10000) {
    return "/whale1.svg";
  }
  if (volume >= 3000) {
    return "/dolphin.svg";
  }
  if (volume > 1000) {
    return "/fish1.svg";
  }
  if (volume > 1) {
    return "/shrimp.svg";
  }
  return "/flea.svg";
}

export function getVolumeTooltip(volume: number): string {
  if (volume >= 10000) {
    return "Whale (>$10k)";
  }
  if (volume >= 3000) {
    return "Dolphin (>$3k)";
  }
  if (volume > 1000) {
    return "Fish (>$1k)";
  }
  if (volume > 1) {
    return "Shrimp (>$1)";
  }
  return "Flea (<$1)";
}

export function getPrice(price: number, expanded = false): string {
  if (!isFinite(price) || price <= 0) {
    return '';
  }

  const bn = new BigNumber(price);

  if (price >= 1) {
    return bn.decimalPlaces(expanded ? 4 : 2, BigNumber.ROUND_DOWN).toString();
  }

  if (price >= 0.01) {
    return bn.decimalPlaces(expanded ? 6 : 4, BigNumber.ROUND_DOWN).toString();
  }

  const str = bn.toFixed();
  const match = str.match(/^0\.(0*)(\d+)/);

  if (match) {
    const zeros = match[1].length;
    const totalDigits = zeros + (expanded ? 10 : 6);
    return bn.decimalPlaces(totalDigits, BigNumber.ROUND_DOWN).toString();
  }

  return bn.toPrecision(expanded ? 12 : 6, BigNumber.ROUND_DOWN).toString();
}

export function getAgo(date: Date, isShort = false): string {
  const now = new Date();
  const milliseconds = now.getTime() - date.getTime();

  let intervals: Record<string, number> = {
    year: 31536000000,
    month: 2592000000,
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    s: 1000,
  };
  if (isShort) {
    intervals = {
      y: 31536000000,
      mo: 2592000000,
      d: 86400000,
      h: 3600000,
      min: 60000,
      sec: 1000,
    };
  }

  for (const [unit, value] of Object.entries(intervals)) {
    const interval = Math.floor(milliseconds / value);
    if (interval >= 1) {
      return `${interval}${unit} ${isShort ? '' : 'ago'}`;
    }
  }

  if (Number.isNaN(milliseconds)) {
    return `0ms${isShort ? '' : ' ago'}`;
  }

  return `${(Math.abs(milliseconds)).toFixed(2)}ms${isShort ? '' : ' ago'}`;
}

export function formatTimeDifference(futureDate: Date, now: Date) {
  const diffMs = futureDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return "0s";
  }

  const seconds = Math.floor(diffMs / 1000) % 60;
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
