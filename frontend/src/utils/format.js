export const DEFAULT_FILTERS = {
  month: '2025-09',
  district: '',
  block: '',
  grade: '',
  subject: '',
};

export function pct(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return '—';
  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(digits)}%`;
}

export function num(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString();
}

export function changeLabel(changePoints) {
  if (changePoints == null) return null;
  const sign = changePoints >= 0 ? '+' : '';
  return `${sign}${changePoints.toFixed(1)} pp`;
}

export const STATUS_COLORS = {
  'On Track': '#15803d',
  Behind: '#a16207',
  'At Risk': '#c2410c',
  Critical: '#b91c1c',
};

export const STATUS_BG = {
  'On Track': '#ecfdf5',
  Behind: '#fefce8',
  'At Risk': '#fff7ed',
  Critical: '#fef2f2',
};

export function monthLabel(month) {
  const map = { '2025-07': 'July 2025', '2025-08': 'August 2025', '2025-09': 'September 2025' };
  return map[month] || month;
}
