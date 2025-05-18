import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from './Topbar';
import './style.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const username = localStorage.getItem('username');
      if (!username) {
        navigate('/login');
        return;
      }
      
      // Cargar los proyectos del usuario
      try {
        const response = await fetch('http://localhost:3001/api/projects', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('username')}`
          }
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los proyectos');
        }

        const data = await response.json();
        setProjects(data.projects);
      } catch (err) {
        setError('Error al cargar los proyectos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/project/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Proyecto eliminado correctamente");

      // Actualizar la lista de proyectos sin recargar
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      alert("Error al eliminar el proyecto: " + err.message);
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  if (loading) {
    return <div className="container">Cargando proyectos...</div>;
  }

  return (
    <>
    <Topbar />
        <div className="container">
        <h2 className="titulo">Mis Proyectos</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="projects-container">
            {projects.length === 0 ? (
            <p>No tienes proyectos actualmente. ¡Crea uno nuevo!</p>
            ) : (
            <ul className="projects-list">
                {projects.map(project => (
                <li key={project.id} className="project-item">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <p><strong>Tu rol:</strong> {project.rol}</p>
                    <p><strong>Fecha de inicio:</strong> {new Date(project.date).toLocaleString('es-ES', { timeZone: 'UTC', dateStyle: 'short' })}</p>
                    <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="view-project-btn"
                    >
                    Ver detalles
                    </button>

                    {project.rol === 'Administrador de Proyecto' && (
                      <>
                      <button
                        onClick={() => navigate(`/project/${project.id}/edit`)}
                        style={{ backgroundColor: '#007bff', color: 'white', marginLeft: '10px' }}
                      >
                        Editar
                      </button>

                      <button
                        className="delete-btn"
                        style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: '10px' }}
                        onClick={() => handleDeleteProject(project.id)}
                        >
                        Eliminar
                      </button>
                      </>
                    )}
                </li>
                ))}
            </ul>
            )}
        </div>
        
        <div className="actions">
            <button onClick={handleCreateProject} className="create-btn">
            Crear Nuevo Proyecto
            </button>
        </div>
        </div>
    </>
  );
}

export default Dashboard;