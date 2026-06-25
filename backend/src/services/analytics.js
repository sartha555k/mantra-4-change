const { classifyRate, classifyIndicator, worstStatus, formatPercent } = require('./riskEngine');

const MONTHS = ['2025-07', '2025-08', '2025-09'];

const GRADE_PATTERNS = {
  '6': /\b6\b|Class 6|Classes 6/,
  '7': /\b7\b|Class 7|Classes 7/,
  '8': /\b8\b|Class 8|Classes 8/,
};

function parseFilters(query) {
  return {
    month: query.month || '2025-09',
    district: query.district || '',
    block: query.block || '',
    grade: query.grade || '',
    subject: query.subject || '',
  };
}

function matchesGrade(classes, grade) {
  if (!grade) return true;
  const pattern = GRADE_PATTERNS[grade];
  if (!pattern) return true;
  return pattern.test(classes || '');
}

function matchesSubject(recordSubject, filterSubject) {
  if (!filterSubject) return true;
  if (filterSubject === 'Math and Science') {
    return recordSubject === 'Math and Science';
  }
  if (filterSubject === 'Math') {
    return recordSubject === 'Math' || recordSubject === 'Math and Science';
  }
  if (filterSubject === 'Science') {
    return recordSubject === 'Science' || recordSubject === 'Math and Science';
  }
  return recordSubject === filterSubject;
}

function buildMatch(filters) {
  const match = { reportingMonth: filters.month };
  if (filters.district) match.district = filters.district;
  if (filters.block) match.block = filters.block;
  return match;
}

function filterRecords(records, filters) {
  return records.filter((r) => {
    if (filters.month && r.reportingMonth !== filters.month) return false;
    if (filters.district && r.district !== filters.district) return false;
    if (filters.block && r.block !== filters.block) return false;
    if (!matchesGrade(r.classes, filters.grade)) return false;
    if (!matchesSubject(r.subject, filters.subject)) return false;
    return true;
  });
}

function computeMetrics(records) {
  const totalSchools = records.length;
  const participating = records.filter((r) => r.pblConducted);
  const withEvidence = participating.filter((r) => r.evidenceSubmitted);
  const totalEnrollment = records.reduce((sum, r) => sum + (r.totalEnrollment || 0), 0);
  const totalAttendance = records.reduce((sum, r) => sum + (r.totalAttendance || 0), 0);

  const participationRate = totalSchools ? participating.length / totalSchools : 0;
  const evidenceRate = participating.length ? withEvidence.length / participating.length : 0;
  const attendanceRate = totalEnrollment ? totalAttendance / totalEnrollment : 0;

  return {
    totalSchools,
    participatingSchools: participating.length,
    participationRate,
    evidenceSubmissionRate: evidenceRate,
    schoolsWithEvidence: withEvidence.length,
    totalEnrollment,
    totalAttendance,
    attendanceRate,
  };
}

function computeMoM(currentMetrics, previousMetrics) {
  function delta(current, previous) {
    if (previous == null || previous === 0) return null;
    return current - previous;
  }

  function deltaPoints(current, previous) {
    const d = delta(current, previous);
    return d == null ? null : d * 100;
  }

  return {
    participationRate: {
      current: currentMetrics.participationRate,
      previous: previousMetrics?.participationRate ?? null,
      changePoints: deltaPoints(currentMetrics.participationRate, previousMetrics?.participationRate),
    },
    evidenceSubmissionRate: {
      current: currentMetrics.evidenceSubmissionRate,
      previous: previousMetrics?.evidenceSubmissionRate ?? null,
      changePoints: deltaPoints(
        currentMetrics.evidenceSubmissionRate,
        previousMetrics?.evidenceSubmissionRate
      ),
    },
    attendanceRate: {
      current: currentMetrics.attendanceRate,
      previous: previousMetrics?.attendanceRate ?? null,
      changePoints: deltaPoints(currentMetrics.attendanceRate, previousMetrics?.attendanceRate),
    },
    participatingSchools: {
      current: currentMetrics.participatingSchools,
      previous: previousMetrics?.participatingSchools ?? null,
      change: delta(currentMetrics.participatingSchools, previousMetrics?.participatingSchools),
    },
  };
}

function previousMonth(month) {
  const idx = MONTHS.indexOf(month);
  return idx > 0 ? MONTHS[idx - 1] : null;
}

function aggregateGeography(records, groupBy) {
  const groups = new Map();

  for (const record of records) {
    const key = record[groupBy];
    if (!key) continue;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(record);
  }

  const results = [];
  for (const [name, groupRecords] of groups) {
    const metrics = computeMetrics(groupRecords);
    const indicators = [
      classifyIndicator('Participation', metrics.participationRate),
      classifyIndicator('Evidence submission', metrics.evidenceSubmissionRate),
      classifyIndicator('Attendance', metrics.attendanceRate),
    ];
    const overallStatus = worstStatus(indicators.map((i) => i.status));

    results.push({
      name,
      district: groupBy === 'block' ? groupRecords[0]?.district : name,
      ...metrics,
      indicators,
      overallStatus,
      compositeScore:
        (metrics.participationRate + metrics.evidenceSubmissionRate + metrics.attendanceRate) / 3,
    });
  }

  return results.sort((a, b) => a.compositeScore - b.compositeScore);
}

function getFilterOptions(records) {
  const districts = [...new Set(records.map((r) => r.district))].filter(Boolean).sort();
  const blocks = [...new Set(records.map((r) => r.block))].filter(Boolean).sort();
  const grades = ['6', '7', '8'];
  const subjects = ['Math and Science', 'Math', 'Science'];
  return { months: MONTHS, districts, blocks, grades, subjects };
}

function getBlocksForDistrict(records, district, month) {
  return [
    ...new Set(
      records
        .filter((r) => r.reportingMonth === month && (!district || r.district === district))
        .map((r) => r.block)
    ),
  ]
    .filter(Boolean)
    .sort();
}

function trendByMonth(allRecords, filters) {
  return MONTHS.map((month) => {
    const monthFilters = { ...filters, month };
    const records = filterRecords(allRecords, monthFilters);
    const metrics = computeMetrics(records);
    return {
      month,
      label: monthLabel(month),
      ...metrics,
      participationStatus: classifyRate(metrics.participationRate),
      evidenceStatus: classifyRate(metrics.evidenceSubmissionRate),
      attendanceStatus: classifyRate(metrics.attendanceRate),
    };
  });
}

function monthLabel(month) {
  const labels = { '2025-07': 'July 2025', '2025-08': 'August 2025', '2025-09': 'September 2025' };
  return labels[month] || month;
}

module.exports = {
  MONTHS,
  parseFilters,
  buildMatch,
  filterRecords,
  computeMetrics,
  computeMoM,
  previousMonth,
  aggregateGeography,
  getFilterOptions,
  getBlocksForDistrict,
  trendByMonth,
  monthLabel,
  formatPercent,
};
