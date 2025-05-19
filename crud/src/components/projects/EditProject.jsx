import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ name: '', description: '', date: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`http://localhost:3001/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProject({
          name: data.project.name,
          description: data.project.description,
          date: data.project.date.slice(0, 10) // Formato yyyy-mm-dd
        });
      } else {
        setMessage("No se pudo cargar el proyecto");
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/project/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(project)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Proyecto actualizado correctamente');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container-login">
      <h2>Editar Proyecto</h2>
      <form className="form-group"onSubmit={handleSubmit}>
        <input name="name" value={project.name} onChange={handleChange} placeholder="Nombre" required />
        <textarea name="description" value={project.description} onChange={handleChange} placeholder="Descripción" />
        <input type="date" name="date" value={project.date} onChange={handleChange} required />
        <button type="submit">Guardar Cambios</button>
        <button type="button" onClick={() => navigate('/dashboard')}>Cancelar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditProject;
