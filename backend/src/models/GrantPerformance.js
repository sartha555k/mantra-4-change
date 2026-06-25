const mongoose = require('mongoose');

const grantPerformanceSchema = new mongoose.Schema({
  grantId: { type: String, index: true },
  donor: String,
  grantName: String,
  reportingMonth: { type: String, index: true },
  periodEndDate: String,
  reportDueDate: String,
  reportStatus: String,
  coveredDistricts: [String],
  sampledSchoolRecords: Number,
  schoolsCompletedPbl: Number,
  pblCompletionRate: Number,
  schoolsWithEvidence: Number,
  evidenceSubmissionRate: Number,
  totalEnrollment: Number,
  totalAttendance: Number,
  attendanceRate: Number,
  riskStatus: String,
  milestoneSummary: String,
  draftReportText: String,
});

module.exports = mongoose.model('GrantPerformance', grantPerformanceSchema);
