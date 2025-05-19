import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../layout/Topbar';
import '../../styles/style.css';

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`http://localhost:3001/api/project/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('username')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProyecto(data.project); // debe contener .fecha_entrega
        setProject(data.project);
        setRolUsuario(data.rol);
      }
    };

    // Cargar actividades del proyecto
    const fetchActivities = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/project/${id}/activities`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('username')}`
          }
        });

        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error("Error al cargar actividades:", err);
      }
    };

  // Función para eliminar actividad
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/activity/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la actividad');
      }

      setActivities(prev => prev.filter(act => act.id !== activityId));
      alert('Actividad eliminada con éxito');
    } catch (err) {
      console.error('Error al eliminar actividad:', err);
      alert(err.message);
    }
  };

  fetchProject();
  fetchActivities();
}, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Cargando...</div>;

  return (
    <>
    <Topbar />
        <div className="container">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p><strong>Fecha de inicio:</strong> {new Date(project.date).toLocaleDateString()}</p>

        <div className="buttongroup">
          {((rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && 
            (proyecto && !project.completed)) && (
            <>
              <button className="button" onClick={() => navigate(`/project/${id}/add-user`)}>Agregar Usuario</button>
              <button className="button" onClick={() => navigate(`/project/${id}/add-requirement`)}>Agregar Requerimiento</button>
              <button className="button" onClick={() => navigate(`/project/${id}/add-activities`)}>Agregar Actividad</button>
            </>
          )}
          <button className="button" onClick={() => navigate(`/project/${id}/users`)}>Ver Usuarios</button>
          <button onClick={() => navigate('/dashboard')}>Volver</button>
        </div>
      {/* Sección de actividades */}
        <div className="activities-section" style={{ marginTop: '40px' }}>
          <h3>Actividades del Proyecto</h3>
          {activities.length === 0 ? (
            <p>No hay actividades registradas aún.</p>
          ) : (
            <ul className="activity-list">
                              {activities.map((act) => (
                  <li key={act.id} className="activity-item">
                    <h4>{act.name}</h4>
                    <p>{act.description || 'Sin descripción'}</p>

                    <div className="activity-buttons" style={{ marginTop: '10px' }}>
                      <button
                        className="button button-small"
                        onClick={() => handleDeleteActivity(act.id)}
                      >
                        Eliminar Actividad
                      </button>

                      <button
                        className="button"
                        onClick={() => navigate(`/project/${id}/activity/${act.id}/add-task`)}
                      >
                        Agregar Tarea
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default ProjectDetails;