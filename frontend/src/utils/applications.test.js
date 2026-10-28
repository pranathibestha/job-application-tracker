import { describe, expect, it } from 'vitest';
import {
  computeStats,
  daysSince,
  filterApplications,
  needsFollowUp,
  validateApplication,
  weeklyCounts,
} from './applications';

const today = new Date(2026, 9, 28); // 28 Oct 2026 (Wednesday)

const apps = [
  { id: 1, company: 'Infosys', role: 'Frontend Developer', location: 'Bengaluru', source: 'Naukri', status: 'Applied', appliedDate: '2026-10-15' },
  { id: 2, company: 'TCS', role: 'React Developer', location: 'Hyderabad', source: 'LinkedIn', status: 'Interview', appliedDate: '2026-10-20' },
  { id: 3, company: 'Wipro', role: 'UI Developer', location: 'Chennai', source: 'Naukri', status: 'Rejected', appliedDate: '2026-10-26' },
  { id: 4, company: 'Accenture', role: 'Software Engineer', location: 'Bengaluru', source: 'Referral', status: 'Applied', appliedDate: '2026-10-27' },
];

describe('daysSince', () => {
  it('counts whole days between a date and today', () => {
    expect(daysSince('2026-10-21', today)).toBe(7);
    expect(daysSince('2026-10-28', today)).toBe(0);
  });
});

describe('needsFollowUp', () => {
  it('flags "Applied" applications older than 7 days', () => {
    expect(needsFollowUp(apps[0], today)).toBe(true);
    expect(needsFollowUp(apps[3], today)).toBe(false);
  });

  it('ignores applications that already got a response', () => {
    expect(needsFollowUp({ ...apps[0], status: 'Rejected' }, today)).toBe(false);
  });
});

describe('computeStats', () => {
  it('calculates totals, response rate and follow-ups', () => {
    const stats = computeStats(apps, today);
    expect(stats.total).toBe(4);
    expect(stats.responseRate).toBe(50);
    expect(stats.interviews).toBe(1);
    expect(stats.followUpsDue).toBe(1);
  });

  it('handles an empty list', () => {
    expect(computeStats([], today).responseRate).toBe(0);
  });
});

describe('filterApplications', () => {
  it('searches company, role and location', () => {
    expect(filterApplications(apps, { search: 'react' }).map((a) => a.id)).toEqual([2]);
    expect(filterApplications(apps, { search: 'bengaluru' })).toHaveLength(2);
  });

  it('filters by status and source and sorts by newest first', () => {
    const result = filterApplications(apps, { status: 'Applied', source: 'All' });
    expect(result.map((a) => a.id)).toEqual([4, 1]);
    expect(filterApplications(apps, { source: 'Naukri' })).toHaveLength(2);
  });
});

describe('weeklyCounts', () => {
  it('groups applications by week', () => {
    const weeks = weeklyCounts(apps, 3, today);
    expect(weeks.map((w) => w.count)).toEqual([1, 1, 2]);
  });
});

describe('validateApplication', () => {
  const valid = { company: 'Infosys', role: 'Frontend Developer', appliedDate: '2026-10-20', jobLink: '' };

  it('accepts valid input', () => {
    expect(validateApplication(valid, today)).toEqual({});
  });

  it('rejects missing fields, future dates and invalid links', () => {
    const errors = validateApplication({ company: '', role: '', appliedDate: '2026-11-05', jobLink: 'careers page' }, today);
    expect(Object.keys(errors).sort()).toEqual(['appliedDate', 'company', 'jobLink', 'role']);
  });
});
