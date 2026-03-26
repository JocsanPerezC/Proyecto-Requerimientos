import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";

// Autenticación
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AccountRecovery from "./components/auth/AccountRecovery";
import { UserProvider } from "./components/auth/UserContext";

// Layout
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/layout/Dashboard";

// Usuarios
import AddUserToProject from "./components/users/AddUserToProject";
import UserProfileView from "./components/users/UserProfileView";
import UserProfileEdit from "./components/users/UserProfileEdit";
import EditUserRole from "./components/users/EditUserRole";

// Proyectos
import CreateProject from "./components/projects/CreateProject";
import RegisterProject from "./components/projects/RegisterProject";
import ProjectDetails from "./components/projects/ProjectDetails";
import EditProject from "./components/projects/EditProject";
import ProjectUsers from "./components/projects/ProjectUsers";
import UserProjectProfile from "./components/projects/UserProjectProfile";
import WithProjectRole from "./components/projects/WithProjectRole";

// Requisitos
import CreateRequirement from "./components/projects/Requirements/CreateRequirement";
import EditRequirement from "./components/projects/Requirements/EditRequirement";

// Actividades
import CreateActivities from "./components/projects/Activities/CreateActivities";
import EditActivities from "./components/projects/Activities/EditActivities";

// Tareas
import CreateTask from "./components/projects/Tasks/CreateTask";
import EditTask from "./components/projects/Tasks/EditTask";
import Attachment from "./components/projects/Tasks/Attachment";

// Estilos
import "./styles/style.css";

function App() {
  const [highContrast, setHighContrast] = useState(false);

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  return (
    <UserProvider>
      <Router>
        <div className={`App ${highContrast ? "high-contrast" : ""}`}>
          <button
            onClick={toggleHighContrast}
            style={{ position: "fixed", top: 21, right: 100, zIndex: 1000 }}
          >
            {highContrast ? "Modo normal" : "Alto contraste"}
          </button>

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
            <Route
              path="/project/:id/add-requirement"
              element={<CreateRequirement />}
            />
            <Route
              path="/project/:id/requirement/:requirementId/edit"
              element={<EditRequirement />}
            />

            {/* Actividades */}
            <Route
              path="/project/:id/add-activities"
              element={<CreateActivities />}
            />
            <Route
              path="/project/:id/activity/:activityId/edit"
              element={<EditActivities />}
            />

            {/* Tareas */}
            <Route
              path="/project/:id/activity/:activityId/add-task"
              element={<CreateTask />}
            />
            <Route
              path="/project/:id/activity/:activityId/task/:taskId/edit"
              element={<EditTask />}
            />
            <Route
              path="/project/:id/activity/:activityId/task/:taskId/attachment"
              element={<Attachment />}
            />

            {/* Usuarios en proyecto */}
            <Route
              path="/project/:id/add-user"
              element={<AddUserToProject />}
            />
            <Route
              path="/project/:id/users"
              element={
                <WithProjectRole>
                  <ProjectUsers />
                </WithProjectRole>
              }
            />
            <Route
              path="/project/:id/users/:userId"
              element={
                <WithProjectRole>
                  <UserProjectProfile />
                </WithProjectRole>
              }
            />
            <Route
              path="/project/:id/users/:userId/edit"
              element={
                <WithProjectRole>
                  <EditUserRole />
                </WithProjectRole>
              }
            />

            {/* Otros */}
            <Route path="/topbar" element={<Topbar />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;