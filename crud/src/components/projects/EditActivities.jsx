import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditActivity() {
  const { id, activityId } = useParams(); // id = id del proyecto, activityId = id de la actividad
  const navigate = useNavigate();
  const [activity, setActivity] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/activity/${activityId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('username')}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setActivity({
            name: data.activity.name,
            description: data.activity.description || ''
          });
        } else {
          setMessage('No se pudo cargar la actividad');
        }
      } catch (err) {
        setMessage('Error al cargar la actividad');
      }
    };

    fetchActivity();
  }, [activityId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/activity/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(activity)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('Actividad actualizada correctamente');
      setTimeout(() => navigate(`/project/${id}`), 1000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Editar Actividad</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label>Nombre</label>
          <input name="name" value={activity.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea name="description" value={activity.description} onChange={handleChange} rows="4" />
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

export default EditActivity;
