const mongoose = require('mongoose');

const evidenceMediaSchema = new mongoose.Schema({
  recordId: String,
  recordType: String,
  grantId: { type: String, index: true },
  donor: String,
  reportingMonth: { type: String, index: true },
  district: String,
  title: String,
  summaryOrCaption: String,
  fileName: String,
  relativePath: String,
  usageNote: String,
});

module.exports = mongoose.model('EvidenceMedia', evidenceMediaSchema);
