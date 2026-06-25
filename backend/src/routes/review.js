const express = require('express');
const SchoolResponse = require('../models/SchoolResponse');
const { parseFilters } = require('../services/analytics');
const { buildReviewSummary } = require('../services/reviewSummary');
const { getOrGenerateActions } = require('../services/actionsGenerator');

const router = express.Router();

router.get('/summary', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const allRecords = await SchoolResponse.find().lean();
    const summary = buildReviewSummary(allRecords, filters);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.get('/actions', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const regenerate = req.query.regenerate === 'true';
    const allRecords = await SchoolResponse.find().lean();
    const actions = await getOrGenerateActions(allRecords, filters, regenerate);
    res.json({ filters, actions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
