import { SOURCES, STATUSES } from '../constants';

export default function FilterBar({ filters, onChange }) {
  const update = (event) => onChange({ ...filters, [event.target.name]: event.target.value });

  return (
    <div className="card filter-bar">
      <label className="field field-grow">
        <span>Search</span>
        <input
          type="search"
          name="search"
          placeholder="Company, role or location"
          value={filters.search}
          onChange={update}
        />
      </label>
      <label className="field">
        <span>Status</span>
        <select name="status" value={filters.status} onChange={update}>
          <option value="All">All</option>
          {STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Source</span>
        <select name="source" value={filters.source} onChange={update}>
          <option value="All">All</option>
          {SOURCES.map((source) => (
            <option key={source}>{source}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sort by</span>
        <select name="sortBy" value={filters.sortBy} onChange={update}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="company">Company (A–Z)</option>
        </select>
      </label>
    </div>
  );
}
