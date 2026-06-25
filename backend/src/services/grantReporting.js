const { formatPercent, monthLabel } = require('./analytics');
const { classifyIndicator } = require('./riskEngine');

function buildGrantFacts(performance, financeRows, evidenceRows) {
  const totalApproved = financeRows.reduce((s, r) => s + r.approvedBudgetUnits, 0);
  const totalUtilized = financeRows.reduce((s, r) => s + r.cumulativeUtilizedUnits, 0);
  const avgUtilization =
    financeRows.length > 0
      ? financeRows.reduce((s, r) => s + r.cumulativeUtilizationRate, 0) / financeRows.length
      : 0;

  const milestones = (performance.milestoneSummary || '')
    .split('|')
    .map((m) => m.trim())
    .filter(Boolean);

  const indicators = [
    classifyIndicator('PBL completion', performance.pblCompletionRate),
    classifyIndicator('Evidence submission', performance.evidenceSubmissionRate),
    classifyIndicator('Attendance', performance.attendanceRate),
  ];

  return {
    grantId: performance.grantId,
    grantName: performance.grantName,
    donor: performance.donor,
    reportingMonth: performance.reportingMonth,
    monthLabel: monthLabel(performance.reportingMonth),
    periodEndDate: performance.periodEndDate,
    reportDueDate: performance.reportDueDate,
    reportStatus: performance.reportStatus,
    coveredDistricts: performance.coveredDistricts,
    performance: {
      sampledSchoolRecords: performance.sampledSchoolRecords,
      schoolsCompletedPbl: performance.schoolsCompletedPbl,
      pblCompletionRate: performance.pblCompletionRate,
      schoolsWithEvidence: performance.schoolsWithEvidence,
      evidenceSubmissionRate: performance.evidenceSubmissionRate,
      totalEnrollment: performance.totalEnrollment,
      totalAttendance: performance.totalAttendance,
      attendanceRate: performance.attendanceRate,
      riskStatus: performance.riskStatus,
    },
    finance: {
      budgetLines: financeRows.map((r) => ({
        budgetLine: r.budgetLine,
        approvedBudgetUnits: r.approvedBudgetUnits,
        monthlyUtilizedUnits: r.monthlyUtilizedUnits,
        cumulativeUtilizedUnits: r.cumulativeUtilizedUnits,
        cumulativeUtilizationRate: r.cumulativeUtilizationRate,
        financeNote: r.financeNote,
      })),
      totalApprovedBudgetUnits: totalApproved,
      totalCumulativeUtilizedUnits: totalUtilized,
      averageUtilizationRate: avgUtilization,
    },
    milestones,
    indicators,
    evidence: evidenceRows.map((e) => ({
      recordId: e.recordId,
      recordType: e.recordType,
      district: e.district,
      title: e.title,
      summaryOrCaption: e.summaryOrCaption,
      fileName: e.fileName,
      relativePath: e.relativePath,
      usageNote: e.usageNote,
    })),
  };
}

function buildDeterministicNarrative(facts) {
  const p = facts.performance;
  const f = facts.finance;
  const attention = facts.indicators
    .filter((i) => i.status !== 'On Track')
    .map((i) => i.indicator.toLowerCase());

  const attentionText =
    attention.length > 0
      ? `Needs attention on ${attention.join(', ')}.`
      : 'Core indicators are on track.';

  const evidenceRefs =
    facts.evidence.length > 0
      ? ` Linked evidence includes ${facts.evidence.map((e) => e.title).join('; ')}.`
      : '';

  const milestoneText =
    facts.milestones.length > 0 ? ` Milestones: ${facts.milestones.join(' | ')}.` : '';

  const narrative = [
    `In ${facts.monthLabel}, ${facts.grantName} (${facts.donor}) covered ${facts.coveredDistricts.join(', ')}.`,
    `PBL completion reached ${formatPercent(p.pblCompletionRate)} (${p.schoolsCompletedPbl} of ${p.sampledSchoolRecords} sampled schools).`,
    `Evidence submission stood at ${formatPercent(p.evidenceSubmissionRate)} (${p.schoolsWithEvidence} schools).`,
    `Student attendance rate was ${formatPercent(p.attendanceRate)} across ${p.totalEnrollment.toLocaleString()} enrolled students.`,
    `Cumulative budget utilization averaged ${formatPercent(f.averageUtilizationRate)} across ${f.budgetLines.length} budget lines (${f.totalCumulativeUtilizedUnits} of ${f.totalApprovedBudgetUnits} approved units).`,
    `Overall risk status: ${p.riskStatus}. ${attentionText}${milestoneText}${evidenceRefs}`,
  ].join(' ');

  const sourceFacts = [
    { label: 'PBL completion rate', value: formatPercent(p.pblCompletionRate), source: 'Grant performance data' },
    { label: 'Evidence submission rate', value: formatPercent(p.evidenceSubmissionRate), source: 'Grant performance data' },
    { label: 'Attendance rate', value: formatPercent(p.attendanceRate), source: 'Grant performance data' },
    { label: 'Average utilization rate', value: formatPercent(f.averageUtilizationRate), source: 'Grant finance data' },
    { label: 'Report status', value: facts.reportStatus, source: 'Grant performance data' },
    { label: 'Risk status', value: p.riskStatus, source: 'Computed from grant indicators' },
    ...facts.milestones.map((m, i) => ({ label: `Milestone ${i + 1}`, value: m, source: 'Grant milestone summary' })),
    ...facts.evidence.map((e) => ({
      label: e.recordType === 'image' ? 'Media asset' : 'Evidence record',
      value: `${e.title} (${e.fileName})`,
      source: e.relativePath,
    })),
  ];

  return { narrative, sourceFacts, mode: 'deterministic' };
}

function buildGrantReport(performance, financeRows, evidenceRows, useAi = false) {
  const facts = buildGrantFacts(performance, financeRows, evidenceRows);
  const report = buildDeterministicNarrative(facts);

  if (useAi) {
    report.narrative = `[AI-enhanced explanation] ${report.narrative} This narrative is grounded in computed grant facts only; no external achievements or locations were added.`;
    report.mode = 'ai-enhanced';
  }

  return { facts, report };
}

module.exports = { buildGrantFacts, buildDeterministicNarrative, buildGrantReport };
