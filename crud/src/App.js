import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register'; // Asumiendo que ya existe un componente de registro
import Dashboard from './Dashboard'; // Nuestro nuevo componente
import CreateProject from './CreateProject'; // Formulario de creación de proyecto
import ProjectDetails from './ProjectDetails'; // Detalles del proyecto
import AddUserToProject from './AddUserToProject'; 
import RegisterProject from './RegisterProject'; // Registro de proyecto
import './style.css'; // Estilos globales
import Topbar from './Topbar'; // Barra superior
import UserProfileView from './UserProfileView';
import UserProfileEdit from './UserProfileEdit';
import { UserProvider } from './UserContext';
import AccountRecovery from './AccountRecovery'; // Componente para recuperación de cuenta
import ProjectUsers from './ProjectUsers';
import UserProjectProfile from './UserProjectProfile';
import EditUserRole from './EditUserRole';
import WithProjectRole from './WithProjectRole'; // Componente para verificar el rol del usuario en el proyecto
import EditProject from './EditProject';
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