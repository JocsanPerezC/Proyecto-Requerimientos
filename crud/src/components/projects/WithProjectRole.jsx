import { useParams } from 'react-router-dom';
import { ProjectRoleProvider } from './ProjectRoleContext';

function WithProjectRole({ children }) {
  const { id } = useParams();
  return (
    <ProjectRoleProvider projectId={id}>
      {children}
    </ProjectRoleProvider>
  );
}

export default WithProjectRole;
