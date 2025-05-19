import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/style.css';

function CreateTask() {
  const { activityId } = useParams();
  console.log('activityId:', activityId);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    date: '',
    status: 'Pendiente',
    assigned: '',
  });
  const [projectUsers, setProjectUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

useEffect(() => {
  const fetchActivity = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/activity/${activityId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await res.json();
      const projectId = data.activity.projectid;
      console.log('ID del proyecto:', projectId);

      const userRes = await fetch(`http://localhost:3001/api/project/${projectId}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });

      const users = await userRes.json();
      console.log('Usuarios del proyecto:', users);

      // 👇 Corrección clave
      if (Array.isArray(users.users)) {
        setProjectUsers(users.users);
      } else {
        setProjectUsers([]);
        console.warn("No se encontró un arreglo de usuarios en la respuesta:", users);
      }

    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  fetchActivity();
}, [activityId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!taskData.title.trim()) {
        throw new Error('El título de la tarea es obligatorio');
      }

      const payload = {
        name: taskData.title,
        description: taskData.description,
        date: taskData.date,
        status: taskData.status,
        assigned: taskData.assigned,
        activityid: parseInt(activityId)
      };

      console.log("Payload que se va a enviar:", payload);


      const response = await fetch('http://localhost:3001/api/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear la tarea');
        } else {
          const textError = await response.text();
          throw new Error(`Error del servidor (${response.status}): ${textError}`);
        }
      }

      alert('Tarea creada con éxito');
      navigate(-1); // Volver atrás
    } catch (err) {
      console.error("Error en la creación de la tarea:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-login">
      <h2 className="titulo">Crear Nueva Tarea</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={taskData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={taskData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={taskData.status}
            onChange={handleChange}
          >
            <option value="">Seleccionar estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

            <div className="form-group">
            <label htmlFor="assigned">Asignar a:</label>
            <select
                id="assigned"
                name="assigned"
                value={taskData.assigned}
                onChange={handleChange}
                required
            >
                <option value="">-- Selecciona un usuario --</option>
                {Array.isArray(projectUsers) && projectUsers.map(user => (
                <option key={user.id} value={user.id}>
                    {user.name} {user.lastname} ({user.email})
                </option>
                ))}
            </select>
            </div>


        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Tarea'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
