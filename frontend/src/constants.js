export const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

export const SOURCES = ['Naukri', 'LinkedIn', 'Company Website', 'Referral', 'Indeed', 'Other'];

// An application still in "Applied" after this many days needs a follow-up.
export const FOLLOW_UP_DAYS = 7;

export const EMPTY_APPLICATION = {
  company: '',
  role: '',
  location: '',
  jobLink: '',
  source: 'Naukri',
  status: 'Applied',
  appliedDate: '',
  notes: '',
};
