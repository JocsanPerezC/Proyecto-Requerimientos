import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../layout/Topbar';
import '../../styles/style.css';

function ProjectDetails() {
  const { id } = useParams();
  const [taskAttachments, setTaskAttachments] = useState({});
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [tasksByActivity, setTasksByActivity] = useState({});
  const [error, setError] = useState('');
  const [rolUsuario, setRolUsuario] = useState('');
  const navigate = useNavigate();
  const [openActivities, setOpenActivities] = useState({});

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

  const fetchAttachments = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/task/${taskId}/attachments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });

      if (!res.ok) throw new Error("Error al obtener archivos adjuntos");

      const data = await res.json();
      setTaskAttachments(prev => ({ ...prev, [taskId]: data.attachments }));
    } catch (err) {
      console.error("Error al obtener attachments:", err);
    }
  };



  // Función para obtener tareas por actividad
  const fetchTasksForActivity = async (activityId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/activity/${activityId}/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await response.json();
      const tasks = data.tasks || [];

      // Guardar tareas por actividad
      setTasksByActivity(prev => ({
        ...prev,
        [activityId]: tasks
      }));

      // Obtener attachments por cada tarea
      tasks.forEach(task => {
        fetchAttachments(task.id);
      });

    } catch (err) {
      console.error(`Error al cargar tareas de la actividad ${activityId}:`, err);
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

const toggleActivityTasks = (activityId) => {
  setOpenActivities(prev => ({
    ...prev,
    [activityId]: !prev[activityId]
  }));
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
                    <p style={{
                        color:
                          req.status === 'Pendiente' ? 'red' :
                          req.status=== 'En progreso' ? 'orange' :
                          req.status === 'Completada' ? 'green' :
                          'black',
                        fontWeight: 'bold'
                      }}>
                        {req.status}
                      </p>
                    {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
                      <div className="requirement-buttons">
                        <button
                          className="button button-small-delete"
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
                    <div className="activity-header">
                      <div className="activity-info">
                        <h4>{act.name}</h4>
                        <p className="activity-description">{act.description || 'Sin descripción'}</p>
                      </div>

                      {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
                        <div className="activity-buttons-vertical">
                          <button className="delete-btn" onClick={() => handleDeleteActivity(act.id)}>Eliminar Actividad</button>
                          <button onClick={() => navigate(`/project/${id}/activity/${act.id}/edit`)}>Editar Actividad</button>
                          <button onClick={() => navigate(`/project/${id}/activity/${act.id}/add-task`)}>Agregar Tarea</button>
                        </div>
                      )}
                    </div>

                    <div className="task-section">
                    <div className="section-header-tasks" onClick={() => toggleActivityTasks(act.id)}>
                      <p>Tareas</p>
                      <span className="toggle-icon">{openActivities[act.id] ? '▲' : '▼'}</span>
                    </div>

                    {openActivities[act.id] && (
                      tasksByActivity[act.id] && tasksByActivity[act.id].length > 0 ? (
                        <ul className="task-list">
                          {tasksByActivity[act.id].map(task => (
                            <li key={task.id} className="task-item-flex">                       
                              <div className="task-info">
                                <div className="task-header">
                                  <strong>{task.title}</strong>
                                  <div className="task-action-buttons">
                                    {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
                                      <>
                                        <button className="delete-btn" onClick={() => handleDeleteTask(task.id, act.id)}>Eliminar Tarea</button>
                                        <button onClick={() => navigate(`/project/${id}/activity/${act.id}/task/${task.id}/edit`)}>Editar Tarea</button>
                                      </>
                                    )}
                                    <button onClick={() => navigate(`/project/${id}/activity/${act.id}/task/${task.id}/attachment`)}>Ver Archivos Adjuntos</button>
                                  </div>
                                </div>
                                <p>{task.description || 'Sin descripción'}</p>
                                <p style={{
                                  color:
                                    task.status === 'Pendiente' ? 'red' :
                                    task.status=== 'En progreso' ? 'orange' :
                                    task.status === 'Completada' ? 'green' :
                                    'black',
                                  fontWeight: 'bold'
                                }}>
                                  {task.status}
                                </p>
                                
                                <p>
                                  Fecha: {
                                    task.date
                                      ? task.date.split('T')[0].split('-').reverse().join('/')
                                      : 'Sin fecha'
                                  }
                                </p>
                                <p>Asignado a: <strong> {task.assignedUsername || 'Sin asignar'} </strong></p>
                              </div>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const file = e.target.elements.file.files[0];
                                  const altText = e.target.elements.alt.value;

                                  const deadline = new Date(task.date);
                                  deadline.setHours(23, 59, 59, 999);
                                  const now = new Date();

                                  if (now > deadline) return alert("Ya no se puede entregar esta tarea.");
                                  if (!file) return alert("Debe seleccionar un archivo.");
                                  if (file.size > 2 * 1024 * 1024 * 1024) return alert("El archivo no debe superar los 2GB.");

                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("taskId", task.id);
                                  formData.append("altText", altText);

                                  try {
                                    const res = await fetch("http://localhost:3001/api/tasks/upload", {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${localStorage.getItem("username")}`
                                      },
                                      body: formData
                                    });

                                    const result = await res.json();
                                    alert(result.message);
                                  } catch (err) {
                                    alert("Error al subir el archivo.");
                                  }
                                }}
                              >
                                <input type="file" name="file" accept="image/*,video/*" required />
                                <input type="text" name="alt" placeholder="Texto alternativo" maxLength="255" />
                                <button type="submit">Subir archivo</button>
                              </form>
                            </li>
                          ))}

                        </ul>
                      ) : (
                        <p>No hay tareas para esta actividad.</p>
                      )
                    )}
                  </div>
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
