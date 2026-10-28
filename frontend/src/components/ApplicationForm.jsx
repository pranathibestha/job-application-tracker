import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EMPTY_APPLICATION, SOURCES, STATUSES } from '../constants';
import { toISODate, validateApplication } from '../utils/applications';

export default function ApplicationForm({ initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState({
    ...EMPTY_APPLICATION,
    appliedDate: toISODate(new Date()),
    ...initialValues,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateApplication(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        ...values,
        company: values.company.trim(),
        role: values.role.trim(),
        location: values.location.trim(),
        jobLink: values.jobLink.trim(),
        notes: values.notes.trim(),
      });
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const errorText = (name) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="company">Company *</label>
          <input {...fieldProps('company')} placeholder="e.g. Infosys" autoFocus />
          {errorText('company')}
        </div>
        <div className="field">
          <label htmlFor="role">Job role *</label>
          <input {...fieldProps('role')} placeholder="e.g. Frontend Developer" />
          {errorText('role')}
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input {...fieldProps('location')} placeholder="e.g. Bengaluru" />
        </div>
        <div className="field">
          <label htmlFor="appliedDate">Applied date *</label>
          <input type="date" max={toISODate(new Date())} {...fieldProps('appliedDate')} />
          {errorText('appliedDate')}
        </div>
        <div className="field">
          <label htmlFor="source">Source</label>
          <select {...fieldProps('source')}>
            {SOURCES.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select {...fieldProps('status')}>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="jobLink">Job link</label>
          <input type="url" {...fieldProps('jobLink')} placeholder="https://careers.company.com/job/123" />
          {errorText('jobLink')}
        </div>
        <div className="field field-full">
          <label htmlFor="notes">Notes</label>
          <textarea rows="3" {...fieldProps('notes')} placeholder="Recruiter name, referral, interview date…" />
        </div>
      </div>

      <div className="form-actions">
        <Link to="/applications" className="btn">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
