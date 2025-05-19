import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditTask() {
  const { id, activityId, taskId } = useParams(); // id = proyecto
  const navigate = useNavigate();
  const [task, setTask] = useState({
    title: '',
    description: '',
    date: '',
    status: '',
    assigned: ''
  });
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [projectUsers, setProjectUsers] = useState([]);

  useEffect(() => {
    const fetchTaskAndUsers = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/task/${taskId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('username')}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cargar la tarea");

        const { task, role } = data;

        setTask({
          title: task.title,
          description: task.description || '',
          date: task.date ? task.date.split('T')[0] : '',
          status: task.status,
          assigned: task.assigned || ''
        });

        setUserRole(role);

        // 👇 Cargar usuarios del proyecto
        const usersRes = await fetch(`http://localhost:3001/api/project/${task.projectid}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('username')}`
          }
        });

        const usersData = await usersRes.json();
        if (Array.isArray(usersData.users)) {
          setProjectUsers(usersData.users);
        } else {
          setProjectUsers([]);
        }

      } catch (err) {
        console.error('Error al cargar tarea o usuarios:', err);
        setMessage(err.message);
      }
    };

    fetchTaskAndUsers();
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(task)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Tarea actualizada correctamente');
      setTimeout(() => navigate(`/project/${id}`), 1000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Editar Tarea</h2>
      <form onSubmit={handleSubmit} className="project-form">
        {userRole === 'Administrador de Proyecto' && (
          <>
            <div className="form-group">
              <label>Título</label>
              <input
                name="title"
                value={task.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                name="date"
                value={task.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Asignado a</label>
              <select
                name="assigned"
                value={task.assigned}
                onChange={handleChange}
              >
                <option value="">-- Selecciona un usuario --</option>
                {projectUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={() => navigate(`/project/${id}`)}>Cancelar</button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditTask;
