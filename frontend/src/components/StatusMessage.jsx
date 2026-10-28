export function Loading({ text = 'Loading applications…' }) {
  return (
    <div className="status-message" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
