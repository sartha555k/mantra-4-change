const mongoose = require('mongoose');

const schoolResponseSchema = new mongoose.Schema(
  {
    reportingMonth: { type: String, required: true, index: true },
    timestamp: Date,
    schoolName: String,
    schoolCode: { type: String, index: true },
    district: { type: String, index: true },
    block: { type: String, index: true },
    pblConducted: { type: Boolean, index: true },
    evidenceSubmitted: Boolean,
    classes: { type: String, index: true },
    subject: { type: String, index: true },
    enrollmentClass6: Number,
    attendanceClass6Science: Number,
    attendanceClass6Math: Number,
    enrollmentClass7: Number,
    attendanceClass7Science: Number,
    attendanceClass7Math: Number,
    enrollmentClass8: Number,
    attendanceClass8Science: Number,
    attendanceClass8Math: Number,
    totalEnrollment: Number,
    totalAttendance: Number,
    attendanceRate: Number,
    sourceRiskStatus: String,
  },
  { timestamps: true }
);

schoolResponseSchema.index({ reportingMonth: 1, district: 1, block: 1 });

module.exports = mongoose.model('SchoolResponse', schoolResponseSchema);
