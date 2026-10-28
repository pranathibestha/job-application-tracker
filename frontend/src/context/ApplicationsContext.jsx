import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import store from '../services/storage';

const ApplicationsContext = createContext(null);

const initialState = { applications: [], loading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null };
    case 'loaded':
      return { applications: action.payload, loading: false, error: null };
    case 'failed':
      return { ...state, loading: false, error: action.payload };
    case 'added':
      return { ...state, applications: [action.payload, ...state.applications] };
    case 'updated':
      return {
        ...state,
        applications: state.applications.map((app) => (app.id === action.payload.id ? action.payload : app)),
      };
    case 'removed':
      return { ...state, applications: state.applications.filter((app) => app.id !== action.payload) };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function ApplicationsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      dispatch({ type: 'loaded', payload: await store.list() });
    } catch (error) {
      dispatch({ type: 'failed', payload: error.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      ...state,
      reload: load,
      getById: (id) => state.applications.find((app) => String(app.id) === String(id)),
      addApplication: async (data) => dispatch({ type: 'added', payload: await store.create(data) }),
      updateApplication: async (id, data) => dispatch({ type: 'updated', payload: await store.update(id, data) }),
      deleteApplication: async (id) => {
        await store.remove(id);
        dispatch({ type: 'removed', payload: id });
      },
    }),
    [state, load],
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) throw new Error('useApplications must be used inside ApplicationsProvider');
  return context;
}
