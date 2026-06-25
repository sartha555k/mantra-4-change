import StatusBadge from './StatusBadge';
import { pct } from '../utils/format';

export default function GeographyTable({ title, rows, showDistrict = false }) {
  if (!rows?.length) {
    return (
      <div className="panel">
        <h3>{title}</h3>
        <p style={{ color: '#57534e' }}>No geography data for current filters.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              {showDistrict && <th>District</th>}
              <th>Status</th>
              <th>Participation</th>
              <th>Evidence</th>
              <th>Attendance</th>
              <th>Composite</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.name}-${row.district || ''}`}>
                <td>{row.name}</td>
                {showDistrict && <td>{row.district}</td>}
                <td>
                  <StatusBadge status={row.overallStatus || row.status} />
                </td>
                <td>{pct(row.participationRate)}</td>
                <td>{pct(row.evidenceSubmissionRate)}</td>
                <td>{pct(row.attendanceRate)}</td>
                <td>{pct(row.compositeScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
