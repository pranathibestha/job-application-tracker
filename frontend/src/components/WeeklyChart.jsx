/** Simple accessible bar chart built with CSS — no chart library needed. */
export default function WeeklyChart({ data }) {
  const max = Math.max(1, ...data.map((week) => week.count));
  const summary = data.map((week) => `${week.label}: ${week.count}`).join(', ');

  return (
    <div className="bar-chart" role="img" aria-label={`Applications per week. ${summary}`}>
      {data.map((week) => (
        <div className="bar-column" key={week.label}>
          <span className="bar-value">{week.count}</span>
          <div className="bar-track">
            <div className="bar" style={{ height: `${(week.count / max) * 100}%` }} />
          </div>
          <span className="bar-label">{week.label}</span>
        </div>
      ))}
    </div>
  );
}
