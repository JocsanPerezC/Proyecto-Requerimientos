import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register'; // Asumiendo que ya existe un componente de registro
import Dashboard from './components/layout/Dashboard'; // Nuestro nuevo componente
import CreateProject from './components/projects/CreateProject'; // Formulario de creación de proyecto
import ProjectDetails from './components/projects/ProjectDetails'; // Detalles del proyecto
import AddUserToProject from './components/users/AddUserToProject'; 
import RegisterProject from './components/projects/RegisterProject'; // Registro de proyecto
import './styles/style.css'; // Estilos globales
import Topbar from './components/layout/Topbar'; // Barra superior
import UserProfileView from './components/users/UserProfileView';
import UserProfileEdit from './components/users/UserProfileEdit';
import { UserProvider } from './components/auth/UserContext';
import AccountRecovery from './components/auth/AccountRecovery'; // Componente para recuperación de cuenta
import ProjectUsers from './components/projects/ProjectUsers';
import UserProjectProfile from './components/projects/UserProjectProfile';
import EditUserRole from './components/users/EditUserRole';
import WithProjectRole from './components/projects/WithProjectRole'; // Componente para verificar el rol del usuario en el proyecto
import EditProject from './components/projects/EditProject';
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
          <Route path="/register-project/:id" element={<RegisterProject />} />
          <Route path="/topbar" element={<Topbar />} />
          <Route path="/profile" element={<UserProfileView />} />
          <Route path="/profile/edit" element={<UserProfileEdit />} />
          <Route path="/recover" element={<AccountRecovery />} />
          <Route path="/project/:id/users" element={
            <WithProjectRole> 
              <ProjectUsers />
            </WithProjectRole>} />
          <Route path="/project/:id/users/:userId" element={
            <WithProjectRole> 
              <UserProjectProfile />
            </WithProjectRole>} />
          <Route path="/project/:id/users/:userid/edit" element={
            <WithProjectRole> 
              <EditUserRole />
            </WithProjectRole>} />
            <Route path="/project/:id/edit" element={<EditProject />} />
        </Routes>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;