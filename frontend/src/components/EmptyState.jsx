import { Link } from 'react-router-dom';

export default function EmptyState({ title, message, showAddButton = true }) {
  return (
    <div className="card empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {showAddButton && (
        <Link to="/applications/new" className="btn btn-primary">
          Add your first application
        </Link>
      )}
    </div>
  );
}
