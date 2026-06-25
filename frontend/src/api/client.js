const API_BASE = '/api';

async function request(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getFilters: () => request('/program/filters'),
  getBlocks: (district, month) => request('/program/blocks', { district, month }),
  getDashboard: (filters) => request('/program/dashboard', filters),
  getGeography: (filters) => request('/program/geography', filters),
  getRisk: (filters) => request('/program/risk', filters),
  getReviewSummary: (filters) => request('/review/summary', filters),
  getActions: (filters, regenerate = false) =>
    request('/review/actions', { ...filters, regenerate: regenerate ? 'true' : undefined }),
  getGrants: () => request('/grants/list'),
  getGrantReport: (grantId, month) => request('/grants/report', { grantId, month }),
};

export function buildQuery(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
}
