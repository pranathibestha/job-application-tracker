import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STATUSES } from '../constants';
import { daysSince, formatDate, needsFollowUp } from '../utils/applications';

export default function ApplicationTable({ applications, onStatusChange, onDelete }) {
  const [busyId, setBusyId] = useState(null);

  const run = async (id, action) => {
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card table-wrapper">
      <table className="app-table">
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Role</th>
            <th scope="col">Location</th>
            <th scope="col">Source</th>
            <th scope="col">Applied</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td data-label="Company" className="cell-company">
                {app.jobLink ? (
                  <a href={app.jobLink} target="_blank" rel="noopener noreferrer">
                    {app.company}
                  </a>
                ) : (
                  app.company
                )}
              </td>
              <td data-label="Role">{app.role}</td>
              <td data-label="Location">{app.location || '—'}</td>
              <td data-label="Source">{app.source}</td>
              <td data-label="Applied">
                {formatDate(app.appliedDate)}
                {needsFollowUp(app) && (
                  <span className="chip chip-warning" title={`Applied ${daysSince(app.appliedDate)} days ago`}>
                    Follow up
                  </span>
                )}
              </td>
              <td data-label="Status">
                <select
                  className={`status-select status-${app.status.toLowerCase()}`}
                  value={app.status}
                  disabled={busyId === app.id}
                  aria-label={`Status for ${app.company}`}
                  onChange={(event) => run(app.id, () => onStatusChange(app, event.target.value))}
                >
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td className="cell-actions">
                <Link to={`/applications/${app.id}/edit`} className="btn btn-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  disabled={busyId === app.id}
                  onClick={() => {
                    if (window.confirm(`Delete the application for ${app.company}?`)) {
                      run(app.id, () => onDelete(app.id));
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
