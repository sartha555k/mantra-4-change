import { STATUS_BG, STATUS_COLORS } from '../utils/format';

export default function StatusBadge({ status }) {
  return (
    <span
      className="status-badge"
      style={{ background: STATUS_BG[status], color: STATUS_COLORS[status] }}
    >
      {status}
    </span>
  );
}
