/**
 * Data layer. Uses the Flask REST API when VITE_API_URL is set,
 * otherwise stores applications in the browser (localStorage).
 * Both stores expose the same async interface, so the UI does not care which is used.
 */
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'job-tracker:applications';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeLocal(applications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

const localStore = {
  async list() {
    return readLocal();
  },
  async create(data) {
    const application = { ...data, id: crypto.randomUUID() };
    writeLocal([application, ...readLocal()]);
    return application;
  },
  async update(id, data) {
    const applications = readLocal();
    const index = applications.findIndex((app) => String(app.id) === String(id));
    if (index === -1) throw new Error('Application not found.');
    applications[index] = { ...applications[index], ...data, id: applications[index].id };
    writeLocal(applications);
    return applications[index];
  },
  async remove(id) {
    writeLocal(readLocal().filter((app) => String(app.id) !== String(id)));
  },
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check that the backend is running.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const details = body.details ? Object.values(body.details).join(' ') : '';
    throw new Error(details || body.error || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

const apiStore = {
  list: () => request('/api/applications'),
  create: (data) => request('/api/applications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/api/applications/${id}`, { method: 'DELETE' }),
};

export const storageMode = API_URL ? 'api' : 'local';
export default API_URL ? apiStore : localStore;
