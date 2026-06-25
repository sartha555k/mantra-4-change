const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const PBL_FILES = [
  { file: 'PBL_School_Response_Data_July_2025.csv', month: '2025-07' },
  { file: 'PBL_School_Response_Data_August_2025.csv', month: '2025-08' },
  { file: 'PBL_School_Response_Data_September_2025.csv', month: '2025-09' },
];

function readCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function toBool(value) {
  return String(value || '').trim().toLowerCase() === 'yes';
}

function toNum(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizePblRow(row, reportingMonth) {
  return {
    reportingMonth: row['Reporting Month'] || reportingMonth,
    timestamp: row.Timestamp ? new Date(row.Timestamp) : null,
    schoolName: row['What is the name of your school?'],
    schoolCode: row["What is your school's synthetic school code?"],
    district: row['What is the name of your district?'],
    block: row['Block Details'],
    pblConducted: toBool(row['Was the PBL project conducted in your school this month?']),
    evidenceSubmitted: toBool(row['Was evidence submitted for the completed PBL project?']),
    classes: row['In which class/classes did you conduct the PBL project?'],
    subject: row['Which subject do you teach?'],
    enrollmentClass6: toNum(row['Total number of students enrolled in Class 6, including all sections']),
    attendanceClass6Science: toNum(
      row['Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0.']
    ),
    attendanceClass6Math: toNum(
      row['Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0.']
    ),
    enrollmentClass7: toNum(row['Total number of students enrolled in Class 7, including all sections']),
    attendanceClass7Science: toNum(
      row['Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0.']
    ),
    attendanceClass7Math: toNum(
      row['Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0.']
    ),
    enrollmentClass8: toNum(row['Total number of students enrolled in Class 8, including all sections']),
    attendanceClass8Science: toNum(
      row['Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0.']
    ),
    attendanceClass8Math: toNum(
      row['Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0.']
    ),
    totalEnrollment: toNum(row['Derived: Total enrollment across Classes 6-8']),
    totalAttendance: toNum(row['Derived: Total attendance across PBL Science and Math sessions']),
    attendanceRate: toNum(row['Derived: Overall PBL attendance rate']),
    sourceRiskStatus: row['Derived: Risk status'],
  };
}

function loadPblRecords(rootDir) {
  const exportDir = path.join(rootDir, 'csv_exports');
  const records = [];
  for (const { file, month } of PBL_FILES) {
    const rows = readCsv(path.join(exportDir, file));
    for (const row of rows) {
      records.push(normalizePblRow(row, month));
    }
  }
  return records;
}

function loadGrantFinance(rootDir) {
  const rows = readCsv(path.join(rootDir, 'csv', '01_Grant_Profile_and_Finance.csv'));
  return rows.map((row) => ({
    grantId: row.grant_id,
    donor: row.donor,
    grantName: row.grant_name,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    coveredDistricts: row.covered_districts.split(';').map((d) => d.trim()),
    reportingMonth: row.reporting_month,
    budgetLine: row.budget_line,
    approvedBudgetUnits: toNum(row.approved_budget_units),
    monthlyUtilizedUnits: toNum(row.monthly_utilized_units),
    cumulativeUtilizedUnits: toNum(row.cumulative_utilized_units),
    cumulativeUtilizationRate: toNum(row.cumulative_utilization_rate),
    financeNote: row.finance_note,
  }));
}

function loadGrantPerformance(rootDir) {
  const rows = readCsv(path.join(rootDir, 'csv', '02_Grant_Performance_and_Report_Material.csv'));
  return rows.map((row) => ({
    grantId: row.grant_id,
    donor: row.donor,
    grantName: row.grant_name,
    reportingMonth: row.reporting_month,
    periodEndDate: row.period_end_date,
    reportDueDate: row.report_due_date,
    reportStatus: row.report_status,
    coveredDistricts: row.covered_districts.split(';').map((d) => d.trim()),
    sampledSchoolRecords: toNum(row.sampled_school_records),
    schoolsCompletedPbl: toNum(row.schools_completed_pbl),
    pblCompletionRate: toNum(row.pbl_completion_rate),
    schoolsWithEvidence: toNum(row.schools_with_evidence),
    evidenceSubmissionRate: toNum(row.evidence_submission_rate),
    totalEnrollment: toNum(row.total_enrollment),
    totalAttendance: toNum(row.total_attendance),
    attendanceRate: toNum(row.attendance_rate),
    riskStatus: row.risk_status,
    milestoneSummary: row.milestone_summary,
    draftReportText: row.draft_report_text,
  }));
}

function loadEvidenceMedia(rootDir) {
  const rows = readCsv(path.join(rootDir, 'csv', '03_Evidence_and_Media_Index.csv'));
  return rows.map((row) => ({
    recordId: row.record_id,
    recordType: row.record_type,
    grantId: row.grant_id,
    donor: row.donor,
    reportingMonth: row.reporting_month,
    district: row.district,
    title: row.title,
    summaryOrCaption: row.summary_or_caption,
    fileName: row.file_name,
    relativePath: row.relative_path,
    usageNote: row.usage_note,
  }));
}

module.exports = {
  loadPblRecords,
  loadGrantFinance,
  loadGrantPerformance,
  loadEvidenceMedia,
};
