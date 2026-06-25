const express = require('express');
const SchoolResponse = require('../models/SchoolResponse');
const {
  parseFilters,
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
} = require('../services/analytics');
const { classifyIndicator, worstStatus } = require('../services/riskEngine');

const router = express.Router();

async function loadAllRecords() {
  return SchoolResponse.find().lean();
}

router.get('/filters', async (_req, res, next) => {
  try {
    const records = await loadAllRecords();
    const options = getFilterOptions(records);
    res.json(options);
  } catch (err) {
    next(err);
  }
});

router.get('/blocks', async (req, res, next) => {
  try {
    const records = await loadAllRecords();
    const blocks = getBlocksForDistrict(records, req.query.district, req.query.month || '2025-09');
    res.json({ blocks });
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const allRecords = await loadAllRecords();
    const currentRecords = filterRecords(allRecords, filters);

    const prev = previousMonth(filters.month);
    const previousRecords = prev
      ? filterRecords(allRecords, { ...filters, month: prev })
      : [];

    const metrics = computeMetrics(currentRecords);
    const previousMetrics = previousRecords.length ? computeMetrics(previousRecords) : null;
    const mom = computeMoM(metrics, previousMetrics);
    const trend = trendByMonth(allRecords, filters);

    const indicators = [
      classifyIndicator('Participation', metrics.participationRate),
      classifyIndicator('Evidence submission', metrics.evidenceSubmissionRate),
      classifyIndicator('Attendance', metrics.attendanceRate),
    ];

    res.json({
      filters,
      monthLabel: monthLabel(filters.month),
      metrics,
      monthOverMonth: mom,
      indicators,
      overallStatus: worstStatus(indicators.map((i) => i.status)),
      trend,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/geography', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const allRecords = await loadAllRecords();
    const records = filterRecords(allRecords, filters);

    const districts = aggregateGeography(records, 'district');
    const blocks = aggregateGeography(records, 'block');

    res.json({
      filters,
      lowPerformingDistricts: districts.slice(0, 5),
      highPerformingDistricts: [...districts].reverse().slice(0, 5),
      lowPerformingBlocks: blocks.slice(0, 8),
      highPerformingBlocks: [...blocks].reverse().slice(0, 8),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/risk', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const allRecords = await loadAllRecords();
    const records = filterRecords(allRecords, filters);
    const metrics = computeMetrics(records);

    const indicators = [
      classifyIndicator('Participation', metrics.participationRate),
      classifyIndicator('Evidence submission', metrics.evidenceSubmissionRate),
      classifyIndicator('Attendance', metrics.attendanceRate),
    ];

    const districts = aggregateGeography(records, 'district').map((d) => ({
      name: d.name,
      status: d.overallStatus,
      explanations: d.indicators.map((i) => ({ indicator: i.indicator, status: i.status, explanation: i.explanation })),
    }));

    res.json({
      filters,
      overallStatus: worstStatus(indicators.map((i) => i.status)),
      indicators,
      districts: districts.filter((d) => d.status !== 'On Track').slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
