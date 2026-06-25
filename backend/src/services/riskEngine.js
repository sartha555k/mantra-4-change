const RISK_THRESHOLDS = {
  ON_TRACK: 0.75,
  BEHIND: 0.6,
  AT_RISK: 0.35,
};

const RISK_LABELS = ['On Track', 'Behind', 'At Risk', 'Critical'];

function classifyRate(rate) {
  if (rate == null || Number.isNaN(rate)) return 'Critical';
  const value = rate > 1 ? rate / 100 : rate;
  if (value >= RISK_THRESHOLDS.ON_TRACK) return 'On Track';
  if (value >= RISK_THRESHOLDS.BEHIND) return 'Behind';
  if (value >= RISK_THRESHOLDS.AT_RISK) return 'At Risk';
  return 'Critical';
}

function classifyIndicator(name, rate) {
  const status = classifyRate(rate);
  const pct = formatPercent(rate);
  const explanations = {
    'On Track': `${name} at ${pct} meets the on-track threshold (≥75%).`,
    Behind: `${name} at ${pct} is behind target (60–74%). Focused follow-up recommended.`,
    'At Risk': `${name} at ${pct} is at risk (35–59%). Requires immediate program attention.`,
    Critical: `${name} at ${pct} is critical (<35%). Escalate to leadership review.`,
  };
  return {
    indicator: name,
    value: normalizeRate(rate),
    formattedValue: pct,
    status,
    explanation: explanations[status],
  };
}

function normalizeRate(rate) {
  if (rate == null || Number.isNaN(rate)) return 0;
  return rate > 1 ? rate / 100 : rate;
}

function formatPercent(rate) {
  const normalized = normalizeRate(rate);
  return `${(normalized * 100).toFixed(1)}%`;
}

function worstStatus(statuses) {
  const order = { Critical: 0, 'At Risk': 1, Behind: 2, 'On Track': 3 };
  return statuses.reduce((worst, current) =>
    order[current] < order[worst] ? current : worst
  );
}

function riskColor(status) {
  const colors = {
    'On Track': '#16a34a',
    Behind: '#ca8a04',
    'At Risk': '#ea580c',
    Critical: '#dc2626',
  };
  return colors[status] || '#64748b';
}

module.exports = {
  RISK_THRESHOLDS,
  RISK_LABELS,
  classifyRate,
  classifyIndicator,
  normalizeRate,
  formatPercent,
  worstStatus,
  riskColor,
};
