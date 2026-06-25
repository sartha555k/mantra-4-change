import StatusBadge from './StatusBadge';

export default function RiskPanel({ indicators, overallStatus }) {
  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <h3>Risk &amp; Gap Engine</h3>
        {overallStatus && <StatusBadge status={overallStatus} />}
      </div>
      <div className="indicator-list">
        {indicators?.map((item) => (
          <div key={item.indicator} className="indicator-item">
            <div className="indicator-top">
              <strong>{item.indicator}</strong>
              <StatusBadge status={item.status} />
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{item.formattedValue}</div>
            <p>{item.explanation}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.82rem', color: '#57534e', marginTop: '0.85rem' }}>
        Thresholds: On Track ≥75% · Behind 60–74% · At Risk 35–59% · Critical &lt;35%
      </p>
    </div>
  );
}
