import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddApplication from './pages/AddApplication';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';
import EditApplication from './pages/EditApplication';
import NotFound from './pages/NotFound';
import { storageMode } from './services/storage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<AddApplication />} />
          <Route path="/applications/:id/edit" element={<EditApplication />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="container footer muted">
        {storageMode === 'api' ? 'Data saved to the server.' : 'Data saved in this browser.'}
      </footer>
    </>
  );
}
