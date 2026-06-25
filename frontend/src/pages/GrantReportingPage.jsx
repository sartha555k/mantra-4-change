import { useEffect, useState } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { pct, num, monthLabel } from '../utils/format';

export default function GrantReportingPage() {
  const [grants, setGrants] = useState([]);
  const [grantId, setGrantId] = useState('');
  const [month, setMonth] = useState('2025-09');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getGrants()
      .then((res) => {
        setGrants(res.grants || []);
        if (res.grants?.length) {
          setGrantId(res.grants[0].grantId);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!grantId || !month) return;
    setLoading(true);
    setError(null);
    api
      .getGrantReport(grantId, month)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [grantId, month]);

  const selectedGrant = grants.find((g) => g.grantId === grantId);
  const facts = report?.facts;
  const narrative = report?.report;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Grant Reporting Assistant</h1>
          <p>Assemble report-ready sections from structured grant facts and linked evidence</p>
        </div>
      </div>

      <div className="grant-layout">
        <div className="panel">
          <h3>Selection</h3>
          <div className="filter-group" style={{ marginBottom: '0.75rem' }}>
            <label>Grant</label>
            <select value={grantId} onChange={(e) => setGrantId(e.target.value)}>
              {grants.map((g) => (
                <option key={g.grantId} value={g.grantId}>
                  {g.grantName}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Reporting month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {(selectedGrant?.months || ['2025-07', '2025-08', '2025-09']).map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
          {selectedGrant && (
            <p style={{ fontSize: '0.85rem', color: '#57534e', marginTop: '1rem' }}>
              Donor: {selectedGrant.donor}
              <br />
              Covered districts: {facts?.coveredDistricts?.join(', ') || '—'}
            </p>
          )}
        </div>

        <div>
          {loading && <div className="loading">Loading grant report...</div>}
          {error && <div className="error-box">{error}</div>}

          {facts && (
            <>
              <div className="panel" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Fact panel</h3>
                  <StatusBadge status={facts.performance.riskStatus} />
                </div>
                <div className="fact-grid">
                  <div className="fact-item">
                    <span>PBL completion</span>
                    <strong>{pct(facts.performance.pblCompletionRate)}</strong>
                  </div>
                  <div className="fact-item">
                    <span>Evidence submission</span>
                    <strong>{pct(facts.performance.evidenceSubmissionRate)}</strong>
                  </div>
                  <div className="fact-item">
                    <span>Attendance rate</span>
                    <strong>{pct(facts.performance.attendanceRate)}</strong>
                  </div>
                  <div className="fact-item">
                    <span>Avg utilization</span>
                    <strong>{pct(facts.finance.averageUtilizationRate)}</strong>
                  </div>
                  <div className="fact-item">
                    <span>Enrollment</span>
                    <strong>{num(facts.performance.totalEnrollment)}</strong>
                  </div>
                  <div className="fact-item">
                    <span>Report status</span>
                    <strong>{facts.reportStatus}</strong>
                  </div>
                </div>

                <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Finance utilization</h4>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Budget line</th>
                        <th>Approved</th>
                        <th>Monthly</th>
                        <th>Cumulative</th>
                        <th>Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facts.finance.budgetLines.map((row) => (
                        <tr key={row.budgetLine}>
                          <td>{row.budgetLine}</td>
                          <td>{row.approvedBudgetUnits}</td>
                          <td>{row.monthlyUtilizedUnits}</td>
                          <td>{row.cumulativeUtilizedUnits}</td>
                          <td>{pct(row.cumulativeUtilizationRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {facts.milestones?.length > 0 && (
                  <>
                    <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Milestones</h4>
                    <ul className="summary-list">
                      {facts.milestones.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="panel" style={{ marginBottom: '1rem' }}>
                <h3>Report preview</h3>
                <p style={{ fontSize: '0.85rem', color: '#57534e' }}>
                  Mode: {narrative?.mode || 'deterministic'} · Generated explanation cites computed facts only
                </p>
                <div className="narrative-box">{narrative?.narrative}</div>

                <div className="source-facts">
                  <h4 style={{ fontFamily: 'DM Sans' }}>Source facts (traceability)</h4>
                  <ul className="summary-list">
                    {narrative?.sourceFacts?.map((f) => (
                      <li key={`${f.label}-${f.value}`}>
                        <strong>{f.label}:</strong> {f.value} <em>({f.source})</em>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {facts.evidence?.length > 0 && (
                <div className="panel">
                  <h3>Linked evidence &amp; media</h3>
                  <div className="evidence-grid">
                    {facts.evidence.map((item) => (
                      <div key={item.recordId} className="evidence-card">
                        <img
                          src={`/${item.relativePath}`}
                          alt={item.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="body">
                          <strong>{item.title}</strong>
                          <div className="chip" style={{ marginTop: '0.35rem' }}>
                            {item.recordType}
                          </div>
                          <p>{item.summaryOrCaption}</p>
                          <p style={{ fontSize: '0.78rem' }}>{item.fileName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
