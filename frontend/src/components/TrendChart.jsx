import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function TrendChart({ trend }) {
  if (!trend?.length) return null;

  const data = trend.map((t) => ({
    name: t.label?.replace(' 2025', '') || t.month,
    participation: +(t.participationRate * 100).toFixed(1),
    evidence: +(t.evidenceSubmissionRate * 100).toFixed(1),
    attendance: +(t.attendanceRate * 100).toFixed(1),
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`, '']} />
          <Legend />
          <Line type="monotone" dataKey="participation" name="Participation" stroke="#0f766e" strokeWidth={2} />
          <Line type="monotone" dataKey="evidence" name="Evidence" stroke="#b45309" strokeWidth={2} />
          <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#1d4ed8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
