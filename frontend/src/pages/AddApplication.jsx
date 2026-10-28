import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import { useApplications } from '../context/ApplicationsContext';

export default function AddApplication() {
  const { addApplication } = useApplications();
  const navigate = useNavigate();

  return (
    <>
      <div className="page-header">
        <h1>Add application</h1>
      </div>
      <ApplicationForm
        submitLabel="Save application"
        onSubmit={async (data) => {
          await addApplication(data);
          navigate('/applications');
        }}
      />
    </>
  );
}
