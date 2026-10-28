import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import StatusBreakdown from '../components/StatusBreakdown';
import { ErrorMessage, Loading } from '../components/StatusMessage';
import WeeklyChart from '../components/WeeklyChart';
import { useApplications } from '../context/ApplicationsContext';
import { computeStats, daysSince, needsFollowUp, weeklyCounts } from '../utils/applications';

export default function Dashboard() {
  const { applications, loading, error, reload } = useApplications();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (applications.length === 0) {
    return (
      <EmptyState
        title="Start tracking your job search"
        message="Add each job you apply for to see your response rate, interviews and follow-up reminders here."
      />
    );
  }

  const stats = computeStats(applications);
  const followUps = applications
    .filter((app) => needsFollowUp(app))
    .sort((a, b) => a.appliedDate.localeCompare(b.appliedDate));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Your job search at a glance.</p>
        </div>
      </div>

      <section className="stats-grid" aria-label="Summary">
        <StatCard label="Total applications" value={stats.total} />
        <StatCard label="Response rate" value={`${stats.responseRate}%`} hint="Got any reply, including rejections" />
        <StatCard label="Interviews" value={stats.interviews} hint="Interview or offer stage" tone="success" />
        <StatCard label="Follow-ups due" value={stats.followUpsDue} hint="No reply after 7+ days" tone="warning" />
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Applications per week</h2>
          <WeeklyChart data={weeklyCounts(applications)} />
        </section>
        <section className="card">
          <h2>Status breakdown</h2>
          <StatusBreakdown byStatus={stats.byStatus} total={stats.total} />
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <h2>Follow up this week</h2>
          <Link to="/applications">View all</Link>
        </div>
        {followUps.length === 0 ? (
          <p className="muted">You are up to date. No follow-ups are due.</p>
        ) : (
          <ul className="follow-up-list">
            {followUps.slice(0, 5).map((app) => (
              <li key={app.id}>
                <div>
                  <strong>{app.company}</strong>
                  <span className="muted"> · {app.role}</span>
                </div>
                <span className="chip chip-warning">{daysSince(app.appliedDate)} days ago</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
