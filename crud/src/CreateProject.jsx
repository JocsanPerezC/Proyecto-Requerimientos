import React, { useState } from 'react';
import './style.css';

function ProjectManagementApp() {
  // Estado para la aplicación completa
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'profile', 'project-detail'
  const [projects, setProjects] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Estado para el formulario de creación de proyectos
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Pendiente',
    priority: 'Media',
    members: []
  });
  
  // Estado para las tareas del proyecto
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    assignedTo: '',
    dueDate: ''
  });
  
  // Estado para los usuarios/miembros del proyecto
  const [projectUsers, setProjectUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Usuario'
  });
  
  // Estado para los requerimientos del proyecto
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    description: '',
    priority: 'Media',
    status: 'Pendiente'
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Estado para el perfil de usuario
  const [userData, setUserData] = useState({
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    role: 'Administrador'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value
    });
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };
  
  const handleUserFormInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };
  
  const handleRequirementInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequirement({
      ...newRequirement,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Simulamos la petición al servidor
      setTimeout(() => {
        // Añadir el nuevo proyecto a la lista
        const newProject = {
          id: Date.now(),
          name: projectData.name,
          description: projectData.description,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          status: projectData.status,
          priority: projectData.priority
        };
        
        setProjects([...projects, newProject]);
        setMessage('Proyecto creado exitosamente');
        setError('');
        // Limpiar el formulario
        setProjectData({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          status: 'Pendiente',
          priority: 'Media',
          members: []
        });
        setIsUpdating(false);
        setCurrentView('list'); // Volver a la vista de lista después de crear
        
        // Añadir este timeout para limpiar el mensaje después de unos segundos
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }, 1000);
    } catch (err) {
      setError('Error de conexión al servidor');
      setMessage('');
      setIsUpdating(false);
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setMessage('Perfil actualizado exitosamente');
    setTimeout(() => {
      setCurrentView('list');
      setMessage('');
      setIsUserMenuOpen(false);
    }, 2000);
  };
  
  const addTask = (e) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      ...newTask
    };
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      status: 'Pendiente',
      assignedTo: '',
      dueDate: ''
    });
    setMessage('Tarea agregada exitosamente');
    setTimeout(() => setMessage(''), 2000);
  };
  
  const addUser = (e) => {
    e.preventDefault();
    const user = {
      id: Date.now(),
      ...newUser
    };
    setProjectUsers([...projectUsers, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'Usuario'
    });
    setMessage('Usuario agregado exitosamente');
    setTimeout(() => setMessage(''), 2000);
  };
  
  const addRequirement = (e) => {
    e.preventDefault();
    const requirement = {
      id: Date.now(),
      ...newRequirement
    };
    setRequirements([...requirements, requirement]);
    setNewRequirement({
      title: '',
      description: '',
      priority: 'Media',
      status: 'Pendiente'
    });
    setMessage('Requerimiento agregado exitosamente');
    setTimeout(() => setMessage(''), 2000);
  };
  
  const openProject = (project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  // Renderizar la vista de lista de proyectos
  const renderProjectList = () => {
    return (
      <div className="main-content-area">
        {isUpdating && <div className="update-message">se actualiza</div>}
        {message && <div className="success-message">{message}</div>}
        {projects.length > 0 ? (
          <div className="project-list-container">
            <h2>Mis Proyectos</h2>
            {projects.map(project => (
              <div key={project.id} className="project-card" onClick={() => openProject(project)}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-details">
                  <span className="project-status">Estado: {project.status}</span>
                  <span className="project-priority">Prioridad: {project.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-projects">
            <h2>No hay proyectos</h2>
            <p>Haz clic en "Crear proyecto" para comenzar.</p>
          </div>
        )}
      </div>
    );
  };

  // Renderizar el formulario de creación de proyectos
  const renderCreateProjectForm = () => {
    return (
      <div className="container">
        <h2>Crear Nuevo Proyecto</h2>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre del Proyecto:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={projectData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="startDate">Fecha de inicio:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={projectData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">Fecha de finalización:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={projectData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Estado:</label>
            <select
              id="status"
              name="status"
              value={projectData.status}
              onChange={handleInputChange}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Prioridad:</label>
            <select
              id="priority"
              name="priority"
              value={projectData.priority}
              onChange={handleInputChange}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          
          <button type="submit" className="btn-submit">Crear Proyecto</button>
        </form>
      </div>
    );
  };

  // Renderizar el perfil de usuario
  const renderUserProfile = () => {
    return (
      <div className="container">
        <h2>Perfil de Usuario</h2>
        
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleUserSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Nombre:</label>
            <input
              type="text"
              id="userName"
              name="name"
              value={userData.name}
              onChange={handleUserInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userEmail">Email:</label>
            <input
              type="email"
              id="userEmail"
              name="email"
              value={userData.email}
              onChange={handleUserInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userRole">Rol:</label>
            <select
              id="userRole"
              name="role"
              value={userData.role}
              onChange={handleUserInputChange}
            >
              <option value="Administrador">Administrador</option>
              <option value="Gestor">Gestor</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>
          
          <button type="submit" className="btn-submit">Guardar Cambios</button>
        </form>
      </div>
    );
  };
  
  // Renderizar la vista de detalle de proyecto
  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="project-detail-container">
        <div className="project-header">
          <h2>{selectedProject.name}</h2>
          <button className="back-button" onClick={() => setCurrentView('list')}>Volver</button>
          <div className="project-actions">
            <button className="action-button" onClick={() => setCurrentView('project-tasks')}>Agregar tareas</button>
            <button className="action-button" onClick={() => setCurrentView('project-users')}>Agregar usuarios</button>
            <button className="action-button" onClick={() => setCurrentView('project-requirements')}>Agregar requerimientos</button>
            <button className="action-button" onClick={() => setCurrentView('project-manage-users')}>Administrar usuarios</button>
          </div>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <div className="tasks-table">
          <h3>Tabla con las tareas</h3>
          {tasks.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.assignedTo}</td>
                    <td>{task.dueDate}</td>
                    <td>
                      <button className="small-button">Editar</button>
                      <button className="small-button delete">Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay tareas para este proyecto. Haga clic en "Agregar tareas" para crear nuevas tareas.</p>
          )}
          
          <div className="add-activities">
            <button className="action-button" onClick={() => setCurrentView('project-tasks')}>Agregar actividades</button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar el formulario para agregar tareas
  const renderTasksForm = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="container">
        <div className="form-header">
          <h2>Agregar Tarea a {selectedProject.name}</h2>
          <button className="back-button" onClick={() => setCurrentView('project-detail')}>Volver al Proyecto</button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={addTask}>
          <div className="form-group">
            <label htmlFor="title">Título de la Tarea:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleTaskInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="taskDescription">Descripción:</label>
            <textarea
              id="taskDescription"
              name="description"
              value={newTask.description}
              onChange={handleTaskInputChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="taskStatus">Estado:</label>
            <select
              id="taskStatus"
              name="status"
              value={newTask.status}
              onChange={handleTaskInputChange}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="assignedTo">Asignado a:</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={newTask.assignedTo}
              onChange={handleTaskInputChange}
            >
              <option value="">Seleccione un usuario</option>
              {projectUsers.map(user => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
              <option value={userData.name}>{userData.name} (Yo)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dueDate">Fecha de entrega:</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleTaskInputChange}
            />
          </div>
          
          <button type="submit" className="btn-submit">Agregar Tarea</button>
        </form>
      </div>
    );
  };
  
  // Formulario para agregar usuarios al proyecto
  const renderUsersForm = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="container">
        <div className="form-header">
          <h2>Agregar Usuario a {selectedProject.name}</h2>
          <button className="back-button" onClick={() => setCurrentView('project-detail')}>Volver al Proyecto</button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={addUser}>
          <div className="form-group">
            <label htmlFor="userName">Nombre:</label>
            <input
              type="text"
              id="userName"
              name="name"
              value={newUser.name}
              onChange={handleUserFormInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userEmail">Email:</label>
            <input
              type="email"
              id="userEmail"
              name="email"
              value={newUser.email}
              onChange={handleUserFormInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userRole">Rol en el proyecto:</label>
            <select
              id="userRole"
              name="role"
              value={newUser.role}
              onChange={handleUserFormInputChange}
            >
              <option value="Usuario">Usuario</option>
              <option value="Desarrollador">Desarrollador</option>
              <option value="Analista">Analista</option>
              <option value="Gestor">Gestor</option>
            </select>
          </div>
          
          <button type="submit" className="btn-submit">Agregar Usuario</button>
        </form>
      </div>
    );
  };
  
  // Formulario para agregar requerimientos
  const renderRequirementsForm = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="container">
        <div className="form-header">
          <h2>Agregar Requerimiento a {selectedProject.name}</h2>
          <button className="back-button" onClick={() => setCurrentView('project-detail')}>Volver al Proyecto</button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={addRequirement}>
          <div className="form-group">
            <label htmlFor="reqTitle">Título del Requerimiento:</label>
            <input
              type="text"
              id="reqTitle"
              name="title"
              value={newRequirement.title}
              onChange={handleRequirementInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reqDescription">Descripción:</label>
            <textarea
              id="reqDescription"
              name="description"
              value={newRequirement.description}
              onChange={handleRequirementInputChange}
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="reqPriority">Prioridad:</label>
            <select
              id="reqPriority"
              name="priority"
              value={newRequirement.priority}
              onChange={handleRequirementInputChange}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="reqStatus">Estado:</label>
            <select
              id="reqStatus"
              name="status"
              value={newRequirement.status}
              onChange={handleRequirementInputChange}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En análisis">En análisis</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Implementado">Implementado</option>
            </select>
          </div>
          
          <button type="submit" className="btn-submit">Agregar Requerimiento</button>
        </form>
      </div>
    );
  };
  
  // Vista para administrar usuarios
  const renderManageUsers = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="container">
        <div className="form-header">
          <h2>Administrar Usuarios de {selectedProject.name}</h2>
          <button className="back-button" onClick={() => setCurrentView('project-detail')}>Volver al Proyecto</button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <div className="users-list">
          <h3>Usuarios del Proyecto</h3>
          {projectUsers.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projectUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="small-button">Editar</button>
                      <button className="small-button delete">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay usuarios asignados a este proyecto. Haga clic en "Agregar usuarios" para asignar nuevos miembros.</p>
          )}
          
          <button className="action-button" onClick={() => setCurrentView('project-users')}>Agregar Nuevo Usuario</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Barra lateral */}
      <div className="sidebar">
        <h2>proyectos en general</h2>
        <button 
          className="sidebar-button" 
          onClick={() => {
            setCurrentView('create');
            setSelectedProject(null);
          }}
        >
          Crear proyecto
        </button>
        
        {/* Lista de proyectos - solo mostrar los que realmente existen */}
        {projects.length > 0 && (
          <div className="projects-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`project-item ${selectedProject && selectedProject.id === project.id ? 'active-project' : ''}`}
                onClick={() => openProject(project)}
              >
                <span>{project.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Área principal */}
      <div className="main-content">
        {/* Barra superior fija */}
        <div className="top-bar">
          <div className="info-button">i</div>
          
          {/* Perfil de usuario siempre visible */}
          <div className="user-section">
            <div className="user-avatar" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              {/* Avatar del usuario - primera letra del nombre */}
              <span>{userData.name.charAt(0).toUpperCase()}</span>
            </div>
            
            {/* Menú desplegable del usuario */}
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-button" 
                  onClick={() => {
                    setCurrentView('profile');
                    setIsUserMenuOpen(false);
                  }}
                >
                  editar usuario
                </button>
                <button className="user-dropdown-button">cerrar sesion</button>
              </div>
            )}
          </div>
        </div>
        
        {/* Contenido principal cambiante */}
        {currentView === 'list' && renderProjectList()}
        {currentView === 'create' && renderCreateProjectForm()}
        {currentView === 'profile' && renderUserProfile()}
        {currentView === 'project-detail' && renderProjectDetail()}
        {currentView === 'project-tasks' && renderTasksForm()}
        {currentView === 'project-users' && renderUsersForm()}
        {currentView === 'project-requirements' && renderRequirementsForm()}
        {currentView === 'project-manage-users' && renderManageUsers()}
      </div>
    </div>
  );
}

export default ProjectManagementApp;