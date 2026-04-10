import { AssetStatus, AssetCategory } from './types/assets';

export const C = {
  bg:         '#0f1117',
  sidebar:    '#090c13',
  card:       '#1a1f2e',
  cardHover:  '#1f2740',
  border:     '#2d3550',
  borderSub:  '#232844',

  text:       '#e8edf5',
  textSub:    '#8892a4',
  textMuted:  '#4a5568',

  accent:     '#3d8ef0',
  inputBg:    '#111625',
};

export const STATUS_STYLE: Record<AssetStatus, { bg: string; color: string }> = {
  'Active':               { bg: '#0a3324', color: '#4ade80' },
  'Active - Spare':       { bg: '#0a3d2e', color: '#6ee7b7' },
  'In Stock':             { bg: '#0c2240', color: '#60a5fa' },
  'In Stock - Low Usage': { bg: '#1e2535', color: '#8892a4' },
  'Retired':              { bg: '#1e2535', color: '#8892a4' },
  'Lost':                 { bg: '#3d2000', color: '#fbbf24' },
  'Stolen':               { bg: '#3d0c0c', color: '#f87171' },
  'Disposed':             { bg: '#1e2535', color: '#64748b' },
};

export const ZONE_COLORS: Record<string, string> = {
  'Office':        '#3d8ef0',
  'Finishing':     '#f97316',
  'Despatch':      '#a855f7',
  'Receiving':     '#22c55e',
  'Coating':       '#ef4444',
  'Mixing':        '#14b8a6',
  'Security Gate': '#eab308',
  'R&D':           '#06b6d4',
};

export const CATEGORY_CONFIG: Record<AssetCategory, { icon: string; label: string; color: string }> = {
  'Mobile Phone': { icon: '📱', label: 'Telefony',  color: '#3d8ef0' },
  'Laptop':       { icon: '💻', label: 'Laptopy',   color: '#22c55e' },
  'Desktop':      { icon: '🖥️', label: 'Desktopy',  color: '#a855f7' },
  'Printer':      { icon: '🖨️', label: 'Drukarki',  color: '#f97316' },
};
