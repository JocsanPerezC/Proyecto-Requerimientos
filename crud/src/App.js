import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './style.css';
import AccountRecovery from './AccountRecovery';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account-recovery" element={<AccountRecovery />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project-details/:id" element={<ProjectDetails />} />
          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
