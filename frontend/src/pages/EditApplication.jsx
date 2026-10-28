import { useNavigate, useParams } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import EmptyState from '../components/EmptyState';
import { ErrorMessage, Loading } from '../components/StatusMessage';
import { useApplications } from '../context/ApplicationsContext';

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, reload, getById, updateApplication } = useApplications();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const application = getById(id);
  if (!application) {
    return <EmptyState title="Application not found" message="It may have been deleted." showAddButton={false} />;
  }

  return (
    <>
      <div className="page-header">
        <h1>Edit application</h1>
      </div>
      <ApplicationForm
        initialValues={application}
        submitLabel="Update application"
        onSubmit={async (data) => {
          await updateApplication(application.id, data);
          navigate('/applications');
        }}
      />
    </>
  );
}
