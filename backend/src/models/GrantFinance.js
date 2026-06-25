const mongoose = require('mongoose');

const grantFinanceSchema = new mongoose.Schema({
  grantId: { type: String, index: true },
  donor: String,
  grantName: String,
  periodStart: String,
  periodEnd: String,
  coveredDistricts: [String],
  reportingMonth: { type: String, index: true },
  budgetLine: String,
  approvedBudgetUnits: Number,
  monthlyUtilizedUnits: Number,
  cumulativeUtilizedUnits: Number,
  cumulativeUtilizationRate: Number,
  financeNote: String,
});

module.exports = mongoose.model('GrantFinance', grantFinanceSchema);
