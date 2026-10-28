import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApplicationTable from '../components/ApplicationTable';
import EmptyState from '../components/EmptyState';
import FilterBar from '../components/FilterBar';
import { ErrorMessage, Loading } from '../components/StatusMessage';
import { useApplications } from '../context/ApplicationsContext';
import { filterApplications } from '../utils/applications';

const DEFAULT_FILTERS = { search: '', status: 'All', source: 'All', sortBy: 'newest' };

export default function Applications() {
  const { applications, loading, error, reload, updateApplication, deleteApplication } = useApplications();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [actionError, setActionError] = useState('');

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const visible = filterApplications(applications, filters);

  const withErrorHandling = (action) => async (...args) => {
    setActionError('');
    try {
      await action(...args);
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p className="muted">
            Showing {visible.length} of {applications.length}
          </p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          + Add application
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Add the jobs you apply for to start tracking them." />
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} />
          {actionError && <ErrorMessage message={actionError} />}
          {visible.length === 0 ? (
            <div className="card empty-state">
              <p>No applications match your filters.</p>
              <button type="button" className="btn" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </button>
            </div>
          ) : (
            <ApplicationTable
              applications={visible}
              onStatusChange={withErrorHandling((app, status) => updateApplication(app.id, { ...app, status }))}
              onDelete={withErrorHandling(deleteApplication)}
            />
          )}
        </>
      )}
    </>
  );
}
