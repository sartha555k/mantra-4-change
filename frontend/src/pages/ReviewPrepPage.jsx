import { useEffect, useState } from 'react';
import { api, buildQuery } from '../api/client';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import { monthLabel, pct } from '../utils/format';

export default function ReviewPrepPage({ filters, setFilters }) {
  const [summary, setSummary] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(regenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery(filters);
      const [summaryData, actionsData] = await Promise.all([
        api.getReviewSummary(query),
        api.getActions(query, regenerate),
      ]);
      setSummary(summaryData);
      setActions(actionsData.actions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(false);
  }, [filters]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Review Preparation</h1>
          <p>Structured discussion points and recommended actions for {monthLabel(filters.month)}</p>
        </div>
        <button type="button" className="btn secondary" onClick={() => load(true)}>
          Regenerate actions
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <div className="loading">Building review summary...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && summary && (
        <div className="summary-section">
          <div className="panel-grid">
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Monthly review summary</h3>
                <StatusBadge status={summary.overallStatus} />
              </div>
              <p style={{ color: '#57534e' }}>
                Overall program status for filtered scope in {summary.monthLabel}.
              </p>

              <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Achievements</h4>
              <ul className="summary-list">
                {summary.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Gaps &amp; risks</h4>
              <ul className="summary-list">
                {(summary.gaps.length ? summary.gaps : ['No major gaps under current filters.']).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Month-over-month changes</h4>
              <ul className="summary-list">
                {summary.monthChanges?.length ? (
                  summary.monthChanges.map((c) => (
                    <li key={c.metric}>
                      {c.metric}: {c.changePoints != null ? `${c.changePoints.toFixed(1)} pp` : `${c.change} units`} ({c.direction})
                    </li>
                  ))
                ) : (
                  <li>No prior month available for comparison.</li>
                )}
              </ul>
            </div>

            <div className="panel">
              <h3>Discussion points</h3>
              <ol className="summary-list">
                {summary.discussionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ol>

              <h4 style={{ fontFamily: 'DM Sans', marginTop: '1.25rem' }}>Priority districts</h4>
              <ul className="summary-list">
                {summary.priorityDistricts.map((d) => (
                  <li key={d.name}>
                    {d.name} — <StatusBadge status={d.status} /> · participation {pct(d.participationRate)}, evidence{' '}
                    {pct(d.evidenceSubmissionRate)}, attendance {pct(d.attendanceRate)}
                  </li>
                ))}
              </ul>

              <h4 style={{ fontFamily: 'DM Sans', marginTop: '1rem' }}>Priority blocks</h4>
              <ul className="summary-list">
                {summary.priorityBlocks.slice(0, 5).map((b) => (
                  <li key={b.name}>
                    {b.name} ({b.district}) — {b.status}, composite {pct(b.compositeScore)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel">
            <h3>Recommended actions ({actions.length})</h3>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
              {actions.map((action) => (
                <div key={action._id || action.title} className="action-card">
                  <strong>{action.title}</strong>
                  <p style={{ margin: '0.35rem 0', color: '#57534e' }}>{action.description}</p>
                  <div className="action-meta">
                    <span className={`chip ${action.priority?.toLowerCase()}`}>{action.priority} priority</span>
                    <span className="chip">Owner: {action.owner}</span>
                    <span className="chip">Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                    <span className="chip">Status: {action.status}</span>
                    <span className="chip">
                      {action.linkedMetric}: {pct(action.linkedValue)}
                    </span>
                    {action.geography?.label && <span className="chip">{action.geography.type}: {action.geography.label}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
