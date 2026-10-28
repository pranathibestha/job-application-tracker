export default function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`card stat-card stat-${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}
