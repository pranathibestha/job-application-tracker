import { FOLLOW_UP_DAYS, STATUSES } from '../constants';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" as a local date (avoids timezone shifts). */
export function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format a Date as local "YYYY-MM-DD". */
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysSince(dateString, today = new Date()) {
  return Math.round((startOfDay(today) - parseDate(dateString)) / DAY_MS);
}

export function formatDate(dateString) {
  return parseDate(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function needsFollowUp(application, today = new Date()) {
  return application.status === 'Applied' && daysSince(application.appliedDate, today) >= FOLLOW_UP_DAYS;
}

export function computeStats(applications, today = new Date()) {
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  applications.forEach((app) => {
    if (app.status in byStatus) byStatus[app.status] += 1;
  });

  const total = applications.length;
  // Any status other than "Applied" means the company responded (including rejections).
  const responded = total - byStatus.Applied;

  return {
    total,
    byStatus,
    responseRate: total ? Math.round((responded / total) * 100) : 0,
    interviews: byStatus.Interview + byStatus.Offer,
    followUpsDue: applications.filter((app) => needsFollowUp(app, today)).length,
  };
}

export function filterApplications(applications, { search = '', status = 'All', source = 'All', sortBy = 'newest' }) {
  const query = search.trim().toLowerCase();

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !query || [app.company, app.role, app.location].some((field) => field?.toLowerCase().includes(query));
    const matchesStatus = status === 'All' || app.status === status;
    const matchesSource = source === 'All' || app.source === source;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const sorters = {
    newest: (a, b) => b.appliedDate.localeCompare(a.appliedDate),
    oldest: (a, b) => a.appliedDate.localeCompare(b.appliedDate),
    company: (a, b) => a.company.localeCompare(b.company),
  };
  return [...filtered].sort(sorters[sortBy] ?? sorters.newest);
}

/** Number of applications per week (weeks start on Monday) for the last `weeks` weeks. */
export function weeklyCounts(applications, weeks = 6, today = new Date()) {
  const current = startOfDay(today);
  const mondayOffset = (current.getDay() + 6) % 7;
  const thisMonday = new Date(current.getFullYear(), current.getMonth(), current.getDate() - mondayOffset);

  return Array.from({ length: weeks }, (_, index) => {
    const offset = weeks - 1 - index;
    const start = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - offset * 7);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    const count = applications.filter((app) => {
      const applied = parseDate(app.appliedDate);
      return applied >= start && applied < end;
    }).length;
    return {
      label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count,
    };
  });
}

export function validateApplication(values, today = new Date()) {
  const errors = {};
  if (!values.company.trim()) errors.company = 'Company name is required.';
  if (!values.role.trim()) errors.role = 'Job role is required.';

  if (!values.appliedDate) {
    errors.appliedDate = 'Applied date is required.';
  } else if (daysSince(values.appliedDate, today) < 0) {
    errors.appliedDate = 'Applied date cannot be in the future.';
  }

  if (values.jobLink.trim() && !/^https?:\/\/\S+$/i.test(values.jobLink.trim())) {
    errors.jobLink = 'Enter a valid link starting with http:// or https://';
  }
  return errors;
}
