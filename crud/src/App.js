import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register'; // Asumiendo que ya existe un componente de registro
import Dashboard from './Components/layout/Dashboard'; // Nuestro nuevo componente
import CreateProject from './Components/Projects/CreateProject'; // Formulario de creación de proyecto
import ProjectDetails from './Components/Projects/ProjectDetails'; // Detalles del proyecto
import AddUserToProject from './Components/users/AddUserToProject'; 
import RegisterProject from './Components/Projects/RegisterProject'; // Registro de proyecto
import './styles/style.css'; // Estilos globales
import Topbar from './Components/layout/Topbar'; // Barra superior
import UserProfileView from './Components/users/UserProfileView';
import UserProfileEdit from './Components/users/UserProfileEdit';
import { UserProvider } from './Components/auth/UserContext';
import AccountRecovery from './Components/auth/AccountRecovery'; // Componente para recuperación de cuenta
import ProjectUsers from './Components/Projects/ProjectUsers';
import UserProjectProfile from './Components/Projects/UserProjectProfile';
import EditUserRole from './Components/users/EditUserRole';
import WithProjectRole from './Components/Projects/WithProjectRole'; // Componente para verificar el rol del usuario en el proyecto
import EditProject from './Components/Projects/EditProject';
import CreateActivities from './Components/Projects/CreateActivities'; // Componente para crear actividades
import CreateTask from './Components/Projects/CreateTask'; // Componente para crear tareas
// Importar otros componentes necesarios

function App() {
  return (
    <UserProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/project/:id/add-user" element={<AddUserToProject />} />
          <Route path="/register-project" element={<RegisterProject />} />
          <Route path="/project/:id/add-activities" element={<CreateActivities />} />
          <Route path="/project/:id/activity/:activityId/add-task" element={<CreateTask />} />
          <Route path="/topbar" element={<Topbar />} />
          <Route path="/profile" element={<UserProfileView />} />
          <Route path="/profile/edit" element={<UserProfileEdit />} />
          <Route path="/recover" element={<AccountRecovery />} />
          {/* Aquí puedes agregar más rutas según sea necesario */}
        </Routes>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;
