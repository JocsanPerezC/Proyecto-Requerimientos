import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditRequirement() {
  const { id, requirementId } = useParams(); // id = id del proyecto, requirementId = id del requerimiento
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState({
  code: '',
  description: '',
  status: '',
  type: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/requirement/${requirementId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('username')}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          console.log('data', data);
          setRequirement({
          code: data.requirement.code,
          description: data.requirement.description || '',
          status: data.requirement.status ,
          type: data.requirement.type 
        });
        } else {
          setMessage('No se pudo cargar el requerimiento');
        }
      } catch (err) {
        setMessage('Error al cargar el requerimiento');
      }
    };

    fetchRequirement();
  }, [requirementId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequirement(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/requirement/${requirementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(requirement)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('Requerimiento actualizado correctamente');
      setTimeout(() => navigate(`/project/${id}`), 1000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container-login">
      <h2>Editar Requerimiento</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <input name="code" value={requirement.code} onChange={handleChange}placeholder="Nombre" required />
        </div>

        <div className="form-group">
          <textarea name="description" value={requirement.description} onChange={handleChange} placeholder="Descripción" rows="4" />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <p>{requirement.status}</p>
          <select name="status" value={requirement.status} onChange={handleChange} required>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En Progreso</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tipo</label>
          <select name="type" value={requirement.type} onChange={handleChange} required>
            <option value="funcional">Funcional</option>
            <option value="no funcional">No Funcional</option>
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

export default EditRequirement;
