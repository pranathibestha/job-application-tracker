import { STATUSES } from '../constants';

export default function StatusBreakdown({ byStatus, total }) {
  return (
    <ul className="breakdown">
      {STATUSES.map((status) => {
        const count = byStatus[status];
        const percent = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={status}>
            <div className="breakdown-row">
              <span>{status}</span>
              <span className="muted">
                {count} ({percent}%)
              </span>
            </div>
            <div className="progress" aria-hidden="true">
              <div className={`progress-fill fill-${status.toLowerCase()}`} style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
