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
// Componente para agregar usuario a un proyecto
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
          {/* Aquí puedes agregar más rutas según sea necesario */}
        </Routes>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;
