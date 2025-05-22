import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../layout/Topbar';
import '../../styles/style.css';

function ProjectDetails() {
  const { id } = useParams();
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [tasksByActivity, setTasksByActivity] = useState({});
  const [error, setError] = useState('');
  const [rolUsuario, setRolUsuario] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

    // Función para obtener el proyecto
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/project/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('username')}`
          }
        });

        const data = await response.json();
        setProject(data.project);
        setRolUsuario(data.rol);
      } catch (err) {
        setError(err.message);
      }
    };

    // Función para obtener requerimientos
    const fetchRequirements = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/project/${id}/requirements`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('username')}`
          }
        });

        if (!response.ok) throw new Error(`Error ${response.status}: No se encontraron requerimientos`);
        const data = await response.json();
        setRequirements(data.requirements || []);
      } catch (err) {
        console.error("Error al cargar requerimientos:", err);
        setRequirements([]);
      }
    };

    // Función para obtener actividades
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

    fetchProject();
    fetchRequirements();
    fetchActivities();
  }, [id]);

  useEffect(() => {
    if (activities.length > 0) {
      activities.forEach(activity => {
        fetchTasksForActivity(activity.id);
      });
    }
  }, [activities]);

  // Función para obtener tareas por actividad
  const fetchTasksForActivity = async (activityId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/activity/${activityId}/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setTasksByActivity(prev => ({ ...prev, [activityId]: data.tasks }));
      } else {
        console.error("Error al obtener tareas:", data.message);
      }
    } catch (err) {
      console.error("Error al cargar tareas:", err);
    }
  };

  // Maneja la eliminación de requerimientos
  const handleDeleteRequirement = async (requirementId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este requerimiento?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/requirement/${requirementId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el requerimiento');

      setRequirements(prev => prev.filter(req => req.id !== requirementId));
      alert('Requerimiento eliminado con éxito');
    } catch (err) {
      console.error('Error al eliminar requerimiento:', err);
      alert(err.message);
    }
  };

  // Maneja la eliminación de actividades
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

      if (!response.ok) throw new Error('Error al eliminar la actividad');

      setActivities(prev => prev.filter(act => act.id !== activityId));
      alert('Actividad eliminada con éxito');
    } catch (err) {
      console.error('Error al eliminar actividad:', err);
      alert(err.message);
    }
  };

  // Maneja la eliminación de tareas
  const handleDeleteTask = async (taskId, activityId) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

  try {
    const response = await fetch(`http://localhost:3001/api/task/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('username')}`
      }
    });

    if (!response.ok) throw new Error('Error al eliminar la tarea');

    // Actualiza las tareas sin la tarea eliminada
    setTasksByActivity(prev => ({
      ...prev,
      [activityId]: prev[activityId].filter(task => task.id !== taskId)
    }));

    alert('Tarea eliminada con éxito');
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    alert(err.message);
  }
};


  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Cargando...</div>;

  return (
    <>
      <Topbar />
      <div className="container">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p><strong>Fecha de inicio:</strong> {new Date(project.date).toLocaleDateString()}</p>

        <div>
          {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
            <button className="buttonproject" onClick={() => navigate(`/project/${id}/add-user`)}>Agregar Usuario</button>
          )}
          <button className="buttonproject" onClick={() => navigate(`/project/${id}/users`)}>Ver Usuarios</button>
          <button className="buttonproject" onClick={() => navigate('/dashboard')}>Volver</button>
        </div>

        {/* Requerimientos */}
        <div className="collapsible-section">
          <div className="section-header" onClick={() => setRequirementsOpen(!requirementsOpen)}>
            <h3>
              Requerimientos del Proyecto
              <span className="item-count">{requirements.length}</span>
            </h3>
            {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
              <span className="button-count">
                <button onClick={() => navigate(`/project/${id}/add-requirement`)}>Agregar Requerimiento</button>
              </span>
            )}
            <span className={`toggle-icon ${requirementsOpen ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`section-content ${requirementsOpen ? 'open' : ''}`}>
            {requirements.length === 0 ? (
              <p>No hay requerimientos registrados aún.</p>
            ) : (
              <ul className="requirement-list">
                {requirements.map((req) => (
                  <li key={req.id} className="requirement-item">
                    <h4>Código: {req.code}</h4>
                    <p>{req.description || 'Sin detalles'}</p>
                    <p>Tipo: {req.type}</p>
                    <p><strong>{req.status}</strong></p>
                    {(rolUsuario === 'Administrador de Proyecto') && (
                      <div className="requirement-buttons">
                        <button
                          className="button button-small"
                          onClick={() => handleDeleteRequirement(req.id)}
                        >
                          Eliminar Requerimiento
                        </button>
                        <button
                          className="button button-small"
                          onClick={() => navigate(`/project/${id}/requirement/${req.id}/edit`)}
                        >
                          Editar Requerimiento
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actividades y Tareas */}
        <div className="collapsible-section">
          <div className="section-header" onClick={() => setActivitiesOpen(!activitiesOpen)}>
            <h3>
              Actividades del Proyecto
              <span className="item-count">{activities.length}</span>
            </h3>
            {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
              <span className="button-counta">
                <button onClick={() => navigate(`/project/${id}/add-activities`)}>Agregar Actividad</button>
              </span>
            )}
            <span className={`toggle-icon ${activitiesOpen ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`section-content ${activitiesOpen ? 'open' : ''}`}>
            {activities.length === 0 ? (
              <p>No hay actividades registradas aún.</p>
            ) : (
              <ul className="activity-list">
                {activities.map((act) => (
                  <li key={act.id} className="activity-item">
                    <h4>{act.name}</h4>
                    <p>{act.description || 'Sin descripción'}</p>

                    {/* Tareas dentro de la actividad */}
                    <div className="task-section">
                      <strong>Tareas:</strong>
                      {tasksByActivity[act.id] && tasksByActivity[act.id].length > 0 ? (
                        <ul className="task-list">
                          {tasksByActivity[act.id].map(task => (
                            <li key={task.id} className="task-item">
                              <strong>{task.title}</strong> - {task.description || 'Sin descripción'}<br />
                              Estado: {task.status} | Fecha: {task.date ? new Date(task.date).toLocaleDateString() : 'Sin fecha'}<br />
                              Asignado a: {task.assignedUsername || 'Sin asignar'}

                              {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
                                <div className="task-buttons">
                                  <button
                                    className="button button-small"
                                    onClick={() => handleDeleteTask(task.id, act.id)}
                                  >
                                    Eliminar Tarea
                                  </button>
                                  <button
                                    className="button button-small"
                                    onClick={() => navigate(`/project/${id}/activity/${act.id}/task/${task.id}/edit`)}
                                  >
                                    Editar Tarea
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hay tareas para esta actividad.</p>
                      )}
                    </div>

                    {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
                      <div className="activity-buttons">
                        <button className="button button-small" onClick={() => handleDeleteActivity(act.id)}>
                          Eliminar Actividad
                        </button>
                        <button className="button button-small" onClick={() => navigate(`/project/${id}/activity/${act.id}/edit`)}>
                          Editar Actividad
                        </button>
                        <button className="button button-small" onClick={() => navigate(`/project/${id}/activity/${act.id}/add-task`)}>
                          Agregar Tarea
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectDetails;
