const express = require('express');
const GrantFinance = require('../models/GrantFinance');
const GrantPerformance = require('../models/GrantPerformance');
const EvidenceMedia = require('../models/EvidenceMedia');
const { buildGrantReport } = require('../services/grantReporting');

const router = express.Router();

router.get('/list', async (_req, res, next) => {
  try {
    const grants = await GrantPerformance.aggregate([
      {
        $group: {
          _id: '$grantId',
          grantName: { $first: '$grantName' },
          donor: { $first: '$donor' },
          months: { $addToSet: '$reportingMonth' },
        },
      },
      { $sort: { grantName: 1 } },
    ]);

    res.json({
      grants: grants.map((g) => ({
        grantId: g._id,
        grantName: g.grantName,
        donor: g.donor,
        months: g.months.sort(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/report', async (req, res, next) => {
  try {
    const { grantId, month } = req.query;
    if (!grantId || !month) {
      return res.status(400).json({ error: 'grantId and month are required' });
    }

    const performance = await GrantPerformance.findOne({ grantId, reportingMonth: month }).lean();
    if (!performance) {
      return res.status(404).json({ error: 'Grant performance record not found' });
    }

    const financeRows = await GrantFinance.find({ grantId, reportingMonth: month }).lean();
    const evidenceRows = await EvidenceMedia.find({ grantId, reportingMonth: month }).lean();

    const useAi = process.env.USE_AI_NARRATIVE === 'true';
    const result = buildGrantReport(performance, financeRows, evidenceRows, useAi);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
