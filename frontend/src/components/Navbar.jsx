import { NavLink } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

export default function Navbar() {
  const [theme, toggleTheme] = useTheme();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">JT</span>
          Job Tracker
        </NavLink>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/applications">Applications</NavLink>
          <NavLink to="/applications/new" className="btn btn-primary btn-sm">+ Add</NavLink>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  );
}
