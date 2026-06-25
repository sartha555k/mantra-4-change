import { pct, num, changeLabel } from '../utils/format';

function Change({ value, suffix = 'pp' }) {
  if (value == null) return <div className="kpi-sub">No prior month</div>;
  const cls = value >= 0 ? 'up' : 'down';
  const sign = value >= 0 ? '+' : '';
  return (
    <div className={`kpi-change ${cls}`}>
      {sign}
      {typeof value === 'number' ? value.toFixed(1) : value} {suffix} vs prior month
    </div>
  );
}

export default function KpiGrid({ metrics, mom }) {
  if (!metrics) return null;

  const cards = [
    { label: 'Total schools', value: num(metrics.totalSchools) },
    { label: 'Participating schools', value: num(metrics.participatingSchools), change: mom?.participatingSchools?.change, suffix: 'schools' },
    { label: 'Participation rate', value: pct(metrics.participationRate), change: mom?.participationRate?.changePoints },
    { label: 'Evidence submission', value: pct(metrics.evidenceSubmissionRate), change: mom?.evidenceSubmissionRate?.changePoints },
    { label: 'Total enrollment', value: num(metrics.totalEnrollment) },
    { label: 'Total attendance', value: num(metrics.totalAttendance) },
    { label: 'Attendance rate', value: pct(metrics.attendanceRate), change: mom?.attendanceRate?.changePoints },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div key={card.label} className="kpi-card">
          <div className="kpi-label">{card.label}</div>
          <div className="kpi-value">{card.value}</div>
          {card.change != null && <Change value={card.change} suffix={card.suffix || 'pp'} />}
        </div>
      ))}
    </div>
  );
}

export { Change, changeLabel };
