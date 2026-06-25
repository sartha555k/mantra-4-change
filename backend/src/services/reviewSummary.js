const {
  filterRecords,
  computeMetrics,
  computeMoM,
  previousMonth,
  aggregateGeography,
  trendByMonth,
  monthLabel,
  formatPercent,
} = require('./analytics');
const { classifyIndicator, worstStatus } = require('./riskEngine');

function buildReviewSummary(allRecords, filters) {
  const currentRecords = filterRecords(allRecords, filters);
  const prevMonth = previousMonth(filters.month);
  const previousRecords = prevMonth
    ? filterRecords(allRecords, { ...filters, month: prevMonth })
    : [];

  const current = computeMetrics(currentRecords);
  const previous = previousRecords.length ? computeMetrics(previousRecords) : null;
  const mom = computeMoM(current, previous);
  const trend = trendByMonth(allRecords, { ...filters, month: undefined });

  const districts = aggregateGeography(currentRecords, 'district');
  const blocks = aggregateGeography(currentRecords, 'block');

  const lowDistricts = [...districts].slice(0, 3);
  const lowBlocks = [...blocks].slice(0, 5);
  const highDistricts = [...districts].reverse().slice(0, 3);
  const highBlocks = [...blocks].reverse().slice(0, 5);

  const indicators = [
    classifyIndicator('Participation', current.participationRate),
    classifyIndicator('Evidence submission', current.evidenceSubmissionRate),
    classifyIndicator('Attendance', current.attendanceRate),
  ];
  const overallStatus = worstStatus(indicators.map((i) => i.status));

  const achievements = [];
  if (mom.participationRate.changePoints != null && mom.participationRate.changePoints > 0) {
    achievements.push(
      `Participation increased by ${mom.participationRate.changePoints.toFixed(1)} percentage points month-over-month (${formatPercent(previous.participationRate)} → ${formatPercent(current.participationRate)}).`
    );
  }
  if (mom.evidenceSubmissionRate.changePoints != null && mom.evidenceSubmissionRate.changePoints > 0) {
    achievements.push(
      `Evidence submission improved by ${mom.evidenceSubmissionRate.changePoints.toFixed(1)} percentage points (${formatPercent(previous.evidenceSubmissionRate)} → ${formatPercent(current.evidenceSubmissionRate)}).`
    );
  }
  if (mom.attendanceRate.changePoints != null && mom.attendanceRate.changePoints > 0) {
    achievements.push(
      `Attendance rate improved by ${mom.attendanceRate.changePoints.toFixed(1)} percentage points (${formatPercent(previous.attendanceRate)} → ${formatPercent(current.attendanceRate)}).`
    );
  }
  if (highDistricts.length) {
    achievements.push(
      `Top-performing district: ${highDistricts[0].name} with composite score ${(highDistricts[0].compositeScore * 100).toFixed(1)}% across participation, evidence, and attendance.`
    );
  }
  if (!achievements.length) {
    achievements.push(
      `${current.participatingSchools} of ${current.totalSchools} schools participated in PBL this month (${formatPercent(current.participationRate)}).`
    );
  }

  const gaps = indicators
    .filter((i) => i.status === 'At Risk' || i.status === 'Critical' || i.status === 'Behind')
    .map((i) => i.explanation);

  const monthChanges = [];
  if (previous) {
    for (const [key, data] of Object.entries(mom)) {
      if (data.changePoints != null) {
        monthChanges.push({
          metric: key,
          current: data.current,
          previous: data.previous,
          changePoints: data.changePoints,
          direction: data.changePoints >= 0 ? 'up' : 'down',
        });
      } else if (data.change != null) {
        monthChanges.push({
          metric: key,
          current: data.current,
          previous: data.previous,
          change: data.change,
          direction: data.change >= 0 ? 'up' : 'down',
        });
      }
    }
  }

  const discussionPoints = [
    `Overall program status for ${monthLabel(filters.month)} is ${overallStatus}. Review indicator breakdown before field decisions.`,
    lowDistricts.length
      ? `Priority districts needing follow-up: ${lowDistricts.map((d) => `${d.name} (${d.overallStatus})`).join(', ')}.`
      : 'No district-level gaps identified under current filters.',
    lowBlocks.length
      ? `Blocks with lowest composite scores: ${lowBlocks.slice(0, 3).map((b) => `${b.name} (${formatPercent(b.compositeScore)})`).join(', ')}.`
      : 'Block-level performance is evenly distributed under current filters.',
    indicators.find((i) => i.status !== 'On Track')
      ? `Indicator requiring discussion: ${indicators.find((i) => i.status !== 'On Track').indicator} — ${indicators.find((i) => i.status !== 'On Track').explanation}`
      : 'All core indicators are on track under current filters.',
    'Confirm action owners and due dates for priority geographies before closing the review.',
  ];

  return {
    reportingMonth: filters.month,
    monthLabel: monthLabel(filters.month),
    filters,
    overallStatus,
    indicators,
    metrics: current,
    monthOverMonth: mom,
    monthChanges,
    achievements,
    gaps,
    priorityDistricts: lowDistricts.map((d) => ({
      name: d.name,
      status: d.overallStatus,
      participationRate: d.participationRate,
      evidenceSubmissionRate: d.evidenceSubmissionRate,
      attendanceRate: d.attendanceRate,
      compositeScore: d.compositeScore,
    })),
    priorityBlocks: lowBlocks.map((b) => ({
      name: b.name,
      district: b.district,
      status: b.overallStatus,
      compositeScore: b.compositeScore,
    })),
    highPerformingDistricts: highDistricts.map((d) => ({
      name: d.name,
      status: d.overallStatus,
      compositeScore: d.compositeScore,
    })),
    highPerformingBlocks: highBlocks.map((b) => ({
      name: b.name,
      district: b.district,
      compositeScore: b.compositeScore,
    })),
    discussionPoints,
    trend,
  };
}

module.exports = { buildReviewSummary };
