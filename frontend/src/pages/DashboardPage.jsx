import { useEffect, useState } from 'react';
import { api, buildQuery } from '../api/client';
import FilterBar from '../components/FilterBar';
import KpiGrid from '../components/KpiGrid';
import TrendChart from '../components/TrendChart';
import GeographyTable from '../components/GeographyTable';
import RiskPanel from '../components/RiskPanel';
import StatusBadge from '../components/StatusBadge';
import { monthLabel } from '../utils/format';

export default function DashboardPage({ filters, setFilters }) {
  const [dashboard, setDashboard] = useState(null);
  const [geography, setGeography] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const query = buildQuery(filters);

    Promise.all([api.getDashboard(query), api.getGeography(query)])
      .then(([dash, geo]) => {
        if (!active) return;
        setDashboard(dash);
        setGeography(geo);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Program Review Dashboard</h1>
          <p>
            {monthLabel(filters.month)} · deterministic metrics from normalized school response data
          </p>
        </div>
        {dashboard?.overallStatus && <StatusBadge status={dashboard.overallStatus} />}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && dashboard && (
        <>
          <KpiGrid metrics={dashboard.metrics} mom={dashboard.monthOverMonth} />

          <div className="panel-grid">
            <div className="panel">
              <h3>Three-month trend</h3>
              <TrendChart trend={dashboard.trend} />
            </div>
            <RiskPanel indicators={dashboard.indicators} overallStatus={dashboard.overallStatus} />
          </div>

          {geography && (
            <div className="panel-grid" style={{ marginTop: '1rem' }}>
              <GeographyTable title="Low-performing districts" rows={geography.lowPerformingDistricts} />
              <GeographyTable title="High-performing districts" rows={geography.highPerformingDistricts} />
            </div>
          )}

          {geography && (
            <div className="panel-grid" style={{ marginTop: '1rem' }}>
              <GeographyTable title="Blocks needing follow-up" rows={geography.lowPerformingBlocks} showDistrict />
              <GeographyTable title="High-performing blocks" rows={geography.highPerformingBlocks} showDistrict />
            </div>
          )}
        </>
      )}
    </>
  );
}
