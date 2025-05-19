import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from './Topbar';
import '../../styles/style.css';

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

  const handleEntregarProyecto = async (projectId) => {
    if (!window.confirm("¿Estás seguro de que deseas entregar este proyecto?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/project/${projectId}/entregar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Proyecto entregado con éxito");
      // Actualizar proyectos localmente
      setProjects(prev =>
        prev.map(p => p.id === projectId ? { ...p, completed: new Date().toISOString() } : p)
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

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
                    <p><strong>Fecha de entrega:</strong> {project.completed ? new Date(project.completed).toLocaleDateString() : 'No entregado'}</p>
                    <div className="buttongroup">
                      <button 
                      onClick={() => navigate(`/project/${project.id}`)}
                      >
                      Ver detalles
                      </button>

                      {(project.rol === 'Administrador de Proyecto' || project.rol === 'Lider de Proyecto')&& !project.completed && (
                        <>
                          <button onClick={() => navigate(`/project/${project.id}/edit`)}>
                            Editar
                          </button>
                          <button
                            onClick={() => handleEntregarProyecto(project.id)}
                            style={{ backgroundColor: '#28a745', color: 'white', marginLeft: '10px' }}
                        >
                          Entregar Proyecto
                          </button>
                        </>
                      )}
                      {(project.rol === 'Administrador de Proyecto' || project.rol === 'Lider de Proyecto') && (
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: '10px' }}
                          >
                            Eliminar
                          </button>
                        )}
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>
        
        <div >
            <button onClick={handleCreateProject} className="buttoncreate">
            Crear Nuevo Proyecto
            </button>
        </div>
        </div>
    </>
  );
}

export default Dashboard;