import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Autenticación
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import AccountRecovery from './Components/auth/AccountRecovery';
import { UserProvider } from './Components/auth/UserContext';

// Layout
import Topbar from './Components/layout/Topbar';
import Dashboard from './Components/layout/Dashboard';

// Usuarios
import AddUserToProject from './Components/users/AddUserToProject';
import UserProfileView from './Components/users/UserProfileView';
import UserProfileEdit from './Components/users/UserProfileEdit';
import EditUserRole from './Components/users/EditUserRole';

// Proyectos
import CreateProject from './Components/Projects/CreateProject';
import RegisterProject from './Components/Projects/RegisterProject';
import ProjectDetails from './Components/Projects/ProjectDetails';
import EditProject from './Components/Projects/EditProject';
import ProjectUsers from './Components/Projects/ProjectUsers';
import UserProjectProfile from './Components/Projects/UserProjectProfile';
import WithProjectRole from './Components/Projects/WithProjectRole';

// Requisitos
import CreateRequirement from './Components/Projects/Requirements/CreateRequirement';
import EditRequirement from './Components/Projects/Requirements/EditRequirement';

// Actividades
import CreateActivities from './Components/Projects/Activities/CreateActivities';
import EditActivities from './Components/Projects/Activities/EditActivities';

// Tareas
import CreateTask from './Components/Projects/Tasks/CreateTask';
import EditTask from './Components/Projects/Tasks/EditTask';

// Estilos
import './styles/style.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover" element={<AccountRecovery />} />

            {/* Dashboard y perfil */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfileView />} />
            <Route path="/profile/edit" element={<UserProfileEdit />} />

            {/* Proyectos */}
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/register-project/:id" element={<RegisterProject />} />
            <Route path="/project/:id/edit" element={<EditProject />} />

            {/* Requisitos */}
            <Route path="/project/:id/add-requirement" element={<CreateRequirement />} />
            <Route path="/project/:id/requirement/:requirementId/edit" element={<EditRequirement />} />

            {/* Actividades */}
            <Route path="/project/:id/add-activities" element={<CreateActivities />} />
            <Route path="/project/:id/activity/:activityId/edit" element={<EditActivities />} />

            {/* Tareas */}
            <Route path="/project/:id/activity/:activityId/add-task" element={<CreateTask />} />
            <Route path="/project/:id/activity/:activityId/task/:taskId/edit" element={<EditTask />} />

            {/* Usuarios en proyecto */}
            <Route path="/project/:id/add-user" element={<AddUserToProject />} />
            <Route path="/project/:id/users" element={
              <WithProjectRole>
                <ProjectUsers />
              </WithProjectRole>
            } />
            <Route path="/project/:id/users/:userId" element={
              <WithProjectRole>
                <UserProjectProfile />
              </WithProjectRole>
            } />
            <Route path="/project/:id/users/:userId/edit" element={
              <WithProjectRole>
                <EditUserRole />
              </WithProjectRole>
            } />

            {/* Otros */}
            <Route path="/topbar" element={<Topbar />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
