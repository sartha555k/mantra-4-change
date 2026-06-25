const ActionItem = require('../models/ActionItem');
const { aggregateGeography, filterRecords, computeMetrics, monthLabel, formatPercent } = require('./analytics');
const { classifyRate } = require('./riskEngine');

const OWNERS = ['District Coordinator', 'Block Mentor', 'Program Manager', 'M&E Lead', 'Field Lead'];

function dueDateFromMonth(month, daysOffset = 14) {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1, 1);
  date.setDate(date.getDate() + daysOffset);
  return date;
}

function buildActionCandidates(allRecords, filters) {
  const records = filterRecords(allRecords, filters);
  const candidates = [];

  const districts = aggregateGeography(records, 'district');
  for (const d of districts.slice(0, 2)) {
    const weakest = d.indicators.sort((a, b) => a.value - b.value)[0];
    candidates.push({
      title: `Follow up on ${weakest.indicator.toLowerCase()} in ${d.name}`,
      description: `${d.name} is ${d.overallStatus}. ${weakest.explanation}`,
      owner: 'District Coordinator',
      priority: d.overallStatus === 'Critical' ? 'High' : 'Medium',
      dueDate: dueDateFromMonth(filters.month, 10),
      status: 'Open',
      linkedMetric: weakest.indicator,
      linkedValue: weakest.value,
      geography: { type: 'district', label: d.name },
      reportingMonth: filters.month,
    });
  }

  const blocks = aggregateGeography(records, 'block');
  for (const b of blocks.slice(0, 2)) {
    candidates.push({
      title: `Block intervention for ${b.name}`,
      description: `Composite score ${formatPercent(b.compositeScore)} with status ${b.overallStatus}. Coordinate school-level support.`,
      owner: 'Block Mentor',
      priority: b.overallStatus === 'Critical' || b.overallStatus === 'At Risk' ? 'High' : 'Medium',
      dueDate: dueDateFromMonth(filters.month, 12),
      status: 'Open',
      linkedMetric: 'Composite score',
      linkedValue: b.compositeScore,
      geography: { type: 'block', label: b.name },
      reportingMonth: filters.month,
    });
  }

  const metrics = computeMetrics(records);
  if (classifyRate(metrics.evidenceSubmissionRate) !== 'On Track') {
    candidates.push({
      title: 'Evidence submission drive for participating schools',
      description: `Evidence rate is ${formatPercent(metrics.evidenceSubmissionRate)} for ${monthLabel(filters.month)}. Schedule evidence clinics for schools without submissions.`,
      owner: 'M&E Lead',
      priority: 'High',
      dueDate: dueDateFromMonth(filters.month, 7),
      status: 'Open',
      linkedMetric: 'Evidence submission',
      linkedValue: metrics.evidenceSubmissionRate,
      geography: { type: 'subject', label: filters.subject || 'All subjects' },
      reportingMonth: filters.month,
    });
  }

  if (classifyRate(metrics.attendanceRate) !== 'On Track') {
    candidates.push({
      title: 'Attendance improvement plan for PBL sessions',
      description: `Attendance rate is ${formatPercent(metrics.attendanceRate)}. Review session scheduling and teacher support for Class 6–8 PBL.`,
      owner: 'Program Manager',
      priority: 'Medium',
      dueDate: dueDateFromMonth(filters.month, 14),
      status: 'Open',
      linkedMetric: 'Attendance',
      linkedValue: metrics.attendanceRate,
      geography: { type: 'grade', label: filters.grade || 'Classes 6-8' },
      reportingMonth: filters.month,
    });
  }

  return candidates.slice(0, 5);
}

async function getOrGenerateActions(allRecords, filters, regenerate = false) {
  if (regenerate) {
    await ActionItem.deleteMany({ reportingMonth: filters.month });
  }

  let actions = await ActionItem.find({ reportingMonth: filters.month })
    .sort({ priority: 1, dueDate: 1 })
    .limit(5)
    .lean();

  if (!actions.length) {
    const candidates = buildActionCandidates(allRecords, filters);
    if (candidates.length) {
      actions = await ActionItem.insertMany(candidates);
    }
  }

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  return actions
    .map((a) => (a.toObject ? a.toObject() : a))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

module.exports = { buildActionCandidates, getOrGenerateActions, OWNERS };
